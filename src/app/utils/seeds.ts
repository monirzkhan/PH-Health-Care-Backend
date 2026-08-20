import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExists = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});

		if (isSuperAdminExists) {
			console.log("Super Admin Already Exists!");
			return;
		}

		const name = config.super_admin_name;
		const email = config.super_admin_email;
		const password = config.super_admin_password;

		if (!name || !email || !password) {
			throw new Error(
				"Super Admin name, email, password not found in env file",
			);
		}

		const hashPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const superAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashPassword,
				role: Role.SUPER_ADMIN,
				emailVerified: true,
				needPasswordChange: false,
			},
		});
		console.log("Super Admin Created", superAdmin);
	} catch (error) {
		console.log("Super Admin Seeding Error", error);

		await prisma.user.delete({
			where: {
				email: config.super_admin_email,
			},
		});
	}
};
export const seedTesterAdmin = async () => {
	try {
		const isTesterAdminExists = await prisma.user.findUnique({
			where: {
				email: config.tester_admin_email,
			},
		});

		if (isTesterAdminExists) {
			console.log("Tester Admin Already Exists!");
			return;
		}

		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new Error(
				"Tester Admin name, email, password not found in env file",
			);
		}

		const hashPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const TesterAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashPassword,
				role: Role.ADMIN,
				emailVerified: true,
				needPasswordChange: false,
			},
		});
		console.log("Tester Admin Created", TesterAdmin);
	} catch (error) {
		console.log("Tester Admin Seeding Error", error);

		await prisma.user.delete({
			where: {
				email: config.tester_admin_email,
			},
		});
	}
};
export const seedTesterDoctor = async () => {
	try {
		const isTesterDoctorExists = await prisma.user.findUnique({
			where: {
				email: config.tester_doctor_email,
			},
		});

		if (isTesterDoctorExists) {
			console.log("Tester Doctor Already Exists!");
			return;
		}

		const name = config.tester_doctor_name;
		const email = config.tester_doctor_email;
		const password = config.tester_doctor_password;

		if (!name || !email || !password) {
			throw new Error(
				"Tester Doctor name, email, password not found in env file",
			);
		}

		const hashPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const TesterDoctor = await prisma.user.create({
			data: {
				name,
				email,
				password: hashPassword,
				role: Role.DOCTOR,
				emailVerified: true,
				needPasswordChange: false,
			},
		});
		console.log("Tester Doctor Created", TesterDoctor);
	} catch (error) {
		console.log("Tester Doctor Seeding Error", error);

		await prisma.user.delete({
			where: {
				email: config.tester_doctor_email,
			},
		});
	}
};
