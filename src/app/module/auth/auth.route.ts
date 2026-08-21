import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { zoDvalidation } from "../../middleware/validation";
import { userValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	zoDvalidation(userValidation.PatientRegistrationZodSchema),
	AuthController.registerPatient,
);

router.post(
	"/login",
	zoDvalidation(userValidation.userLoginZodSchema),
	AuthController.loginUser,
);

router.get(
	"/me",
	auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reser-password", AuthController.resetPassword);
export const AuthRoutes = router;
