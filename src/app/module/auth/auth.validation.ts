import z from "zod";

const PatientRegistrationZodSchema = z.object({
	name: z
		.string("Not A String!!!!!")
		.min(3, "Name must atleast 3 characters long!!!")
		.max(20, "Name lenth must be within 20 characters long!!!"),
	email: z.email("Not an email"),
	password: z
		.string()
		.min(6)
		.refine((val) => /[A-Z]/.test(val), "Add at least one uppercase letter")
		.refine((val) => /[a-z]/.test(val), "Add at least one lowercase letter")
		.refine((val) => /[^A-Za-z0-9]/.test(val), "Needs special char")
		.refine((val) => /[0-9]/.test(val), "Add at least one number"),
	patient: z.object({
		contactNumber: z.string().optional(),
	}),
});

const userLoginZodSchema = z.object({
	email: z.email("Not an email"),
	password: z
		.string()
		.min(8, "Password Must Minimum 8 Characters Long.")
		.regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
		.regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

		.regex(/[0-9]/, "Password must contain atleast 1 Number")
		.regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
});

const forgotPasswordZodSchema = z.object({
	email: z.email("Email not found"),
});
const resetPasswordZodSchema = z.object({
	email: z.email("Email not found"),
	newPassword: z
		.string()
		.min(8, "Password Must Minimum 8 Characters Long.")
		.regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
		.regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

		.regex(/[0-9]/, "Password must contain atleast 1 Number")
		.regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
	otp: z.string().length(6, "OTP Must be 6 Characters long"),
});
export const userValidation = {
	PatientRegistrationZodSchema,
	userLoginZodSchema,
	forgotPasswordZodSchema,
	resetPasswordZodSchema,
};
