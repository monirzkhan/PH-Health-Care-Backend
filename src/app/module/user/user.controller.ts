import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";

const profileImageUpdate = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new Error("No image uploaded");
	}
	const userId = req.user?.userId;

	const result = await userService.uploadProfileImage(
		req.file?.buffer,
		userId!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Profile Image Updated Successfully",
		data: {
			result,
		},
	});
});

export const userController = {
	profileImageUpdate,
};
