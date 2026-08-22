/** biome-ignore-all lint/correctness/noUnusedVariables: <explanation> */
import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
	IForgotPasswordPayload,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRedisRegisterPatientPayload,
	IRegisterPatientPayload,
	IRequestUser,
	IResetPasswordPayload,
	IVerifyEmailPayload,
} from "./auth.interface";
import { googleClient } from "../../lib/googleAuth";
import { TokenPayload } from "google-auth-library";
import { error } from "console";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import {
	sentOTPEmailTemplate,
	sentPasswordChangedEmailTemplate,
} from "../../utils/emailTemplate";
import path from "path";
import ejs from "ejs";
import { number } from "zod";

const registerPatient = async (payload: IRedisRegisterPatientPayload) => {
	const { name, password, patient: patientData } = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds),
	);

	const emailOTP = crypto.randomInt(100000, 1000000);
	const emailKey = `Patient-Registration-OTP:${email}`;
	const expirationSeconds = 60 * 5;

	await redisClient.set(emailKey, emailOTP, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	const redisDataPayload = {
		name,
		email,
		password: hashedPassword,
		patient: patientData,
	};
	const redisDataKey = `Patient-Registration-Data:${email}`;

	await redisClient.set(redisDataKey, JSON.stringify(redisDataPayload), {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	const templatePath = path.join(
		process.cwd(),
		"/src/app/templates/registation-verification.ejs",
	);
	const templateData = {
		name,
		otp: emailOTP,
		expirationTime: expirationSeconds / 60,
	};

	const html = await ejs.renderFile(templatePath, templateData);
	await transporter.sendMail({
		from: `"PH Healthcare" <${config.smtp_sender}>`,
		to: email,
		subject: "Verify Your Email for Registration",
		html,
	});
};

const verifyEmail = async (payload: IVerifyEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserExist?.status === "BLOCKED") {
		throw new Error("User is Blocked");
	}
	if (isUserExist?.emailVerified) {
		throw new Error("User is already varified");
	}
	if (isUserExist?.isDeleted && isUserExist.status === "DELETED") {
		throw new Error("User is Deleted");
	}

	const emailOTPKey = `Patient-Registration-OTP:${email}`;

	const redisOTP = await redisClient.get(emailOTPKey);
	if (!redisOTP) {
		throw new Error("OTP not found");
	}
	if (redisOTP !== otp) {
		throw new Error("OTP does not match");
	}
	await redisClient.del([emailOTPKey]);

	const redisDataKey = `Patient-Registration-Data:${email}`;
	const redisDataPayload = await redisClient.get(redisDataKey);
	if (!redisDataPayload) {
		throw new Error("User data not found in Redis");
	}

	const patientDataPalyload: IRedisRegisterPatientPayload =
		JSON.parse(redisDataPayload);

	const createdUser = await prisma.user.create({
		data: {
			name: patientDataPalyload.name,
			email: patientDataPalyload.email,
			password: patientDataPalyload.password,
			role: Role.PATIENT,
			status: UserStatus.ACTIVE,
			emailVerified: true,
			patient: {
				create: {
					name: patientDataPalyload.name,
					email: patientDataPalyload.email,
					contactNumber: patientDataPalyload.patient.contactNumber,
				},
			},
		},
		omit: { password: true },
		include: { patient: true },
	});

	const { patient, ...user } = createdUser;
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);
	const templatePath = path.join(
		process.cwd(),
		"/src/app/templates/welcome-email.ejs",
	);
	const templateData = {
		name: patientDataPalyload.name,
		email: patientDataPalyload.email,
		loginUrl: "https://localhost:5000/login",
	};

	const html = await ejs.renderFile(templatePath, templateData);
	await transporter.sendMail({
		from: `"PH Healthcare" <${config.smtp_sender}>`,
		to: email,
		subject: "Welcome! Registration Complete",
		html,
	});
	await redisClient.del([redisDataKey]);

	return {
		user,
		patient,
		accessToken,
		refreshToken,
	};
};
const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted");
	}

	if (user.password === null && user.googleId !== null) {
		throw new Error(
			"User Already has account with Google. Please try to login with google",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			patient: true,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | undefined | null = null;

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google ID Token Verification Failed", error);
		throw new Error("Invalid Or Expired Google Id Token");
	}
	if (!googleIdTokenPayload) {
		throw new Error("Invalid Or Expired Google Id Token");
	}

	if (!googleIdTokenPayload.email) {
		throw new Error("Google Email Not Found");
	}
	if (!googleIdTokenPayload.name) {
		throw new Error("Google Email User Name Not Found");
	}

	const ifPatientExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: Role.PATIENT,
			googleId: googleIdTokenPayload.sub,
		},
	});

	let user = ifPatientExistWithGoogleAuth;

	if (!ifPatientExistWithGoogleAuth) {
		const ifPatientExistWithCredentials = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: Role.PATIENT,
				authProvider: AuthProvider.CREDENTIALS,
			},
		});

		if (ifPatientExistWithCredentials) {
			if (!ifPatientExistWithCredentials.emailVerified) {
				throw new Error("Email not varified");
			}
			if (ifPatientExistWithCredentials.status === UserStatus.BLOCKED) {
				throw new Error("User Is Blocked");
			}

			if (
				ifPatientExistWithCredentials.isDeleted ||
				ifPatientExistWithCredentials.status === UserStatus.DELETED
			) {
				throw new Error("User Is Deleted");
			}

			user = await prisma.user.update({
				where: {
					id: ifPatientExistWithCredentials.id,
				},
				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.PATIENT,
					googleId: googleIdTokenPayload.sub,
					authProvider: AuthProvider.GOOGLE,
					emailVerified: true,
					patient: {
						create: {
							name: googleIdTokenPayload.name,
							email: googleIdTokenPayload.email,
						},
					},
				},
			});
		}
	}
	if (!user) {
		throw new Error("User Not Found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User Is Blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User Is Deleted");
	}
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
	const { email } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!isUserExist) {
		throw new Error("User not found");
	}
	if (isUserExist.status === "BLOCKED") {
		throw new Error("User is Blocked");
	}
	if (!isUserExist.emailVerified) {
		throw new Error("User is not varified");
	}
	if (isUserExist.isDeleted && isUserExist.status === "DELETED") {
		throw new Error("User is Deleted");
	}
	if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
		throw new Error("User account with google");
	}

	const otp = crypto.randomInt(100000, 1000000);
	const key = `Forgot-Password-OTP: ${isUserExist.email}`;
	const expirationSeconds = 5 * 60;

	await redisClient.set(key, otp, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	//Send Email Template using EJS
	const templatePath = path.join(
		process.cwd(),
		"/src/app/templates/forgot-password.ejs",
	);
	const templateData = {
		name: isUserExist.name,
		otp,
		expirationTime: expirationSeconds / 60,
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: `"PH Healthcare"<${config.smtp_sender}>`,
		to: isUserExist.email,
		subject: "Forgot Password",
		html,
	});
};
const resetPassword = async (payload: IResetPasswordPayload) => {
	const { email, newPassword, otp } = payload;
	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!isUserExist) {
		throw new Error("User not found");
	}
	if (isUserExist.status === "BLOCKED") {
		throw new Error("User is Blocked");
	}
	if (!isUserExist.emailVerified) {
		throw new Error("User is not varified");
	}
	if (isUserExist.isDeleted && isUserExist.status === "DELETED") {
		throw new Error("User is Deleted");
	}
	if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
		throw new Error("User account with google");
	}

	const key = `Forgot-Password-OTP: ${isUserExist.email}`;
	const redisOTP = await redisClient.get(key);

	if (!redisOTP) {
		throw new Error("OTP not fount");
	}

	if (redisOTP !== otp) {
		throw new Error("OTP does not match");
	}

	const newHashPassword = await bcrypt.hash(
		newPassword,
		Number(config.bcrypt_salt_rounds),
	);

	const updatedUser = await prisma.user.update({
		where: {
			email: isUserExist.email,
		},
		data: {
			password: newHashPassword,
		},
	});
	await redisClient.del([key]);
	//Send Email Template using Raw HTML
	await transporter.sendMail({
		from: `"PH Healthcare"<${config.smtp_sender}>`,
		to: isUserExist.email,
		subject: "Changed Password",
		html: sentPasswordChangedEmailTemplate({ name: isUserExist.name }),
	});
};

export const AuthService = {
	registerPatient,
	verifyEmail,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgotPassword,
	resetPassword,
};
