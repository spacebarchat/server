import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { FieldError } from "../util/instanceOf";

export function ErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
	try {
		let code = 400;
		let httpcode = code;
		let message = error?.toString();
		let errors = undefined;

		if (error instanceof HTTPError && error.code) code = httpcode = error.code;
		else if (error instanceof FieldError) {
			code = Number(error.code);
			message = error.message;
			errors = error.errors;
		} else {
			console.error(error);
			if (req.server.options.production) {
				message = "Internal Server Error";
			}
			code = httpcode = 500;
		}

		res.status(httpcode).json({ code: code, message, errors });

		return;
	} catch (error) {
		console.error(error);
		return res.status(500).json({ code: 500, message: "Internal Server Error" });
	}
}
