import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import z from "zod";

export const zoDvalidation = (zodSchema: z.ZodObject) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const payload = req.body ?? {};
		const result = zodSchema.safeParse(payload);
		if (!result.success) {
			console.log(result.error);
			console.log(result.error.issues);
			throw new Error(result.error.issues[0].message);
		}

		req.body = result.data;

		next();
	});
};
