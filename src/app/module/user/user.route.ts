import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { upload } from "../../lib/multer";
import { userController } from "./user.controller";

const router = Router();

router.patch(
	"/image-upload",
	auth("ADMIN", "DOCTOR", "PATIENT", "SUPER_ADMIN"),
	upload.single("profileImage"),
	userController.profileImageUpdate,
);

export const UserRoutes = router;
