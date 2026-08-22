import { promise } from "zod";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { UploadApiResponse } from "cloudinary";
import { buffer } from "node:stream/consumers";
import { resolve } from "node:dns";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			imageUrl: true,
			imagePublicId: true,
		},
	});

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},
					async (error, result) => {
						if (error) {
							return reject(error);
						}
						if (!result) {
							return reject(new Error("no result returned from curdinary"));
						}
						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			imageUrl: cloudinaryResult.secure_url,
			imagePublicId: cloudinaryResult.public_id,
		},
		omit: {
			password: true,
		},
	});
	if (currentUser?.imageUrl && currentUser.imagePublicId) {
		await cloudinary.uploader.destroy(currentUser.imagePublicId);
	}
	return updatedUser;
};

export const userService = {
	uploadProfileImage,
};
