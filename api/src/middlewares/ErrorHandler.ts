import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { FieldError } from "../util/instanceOf";

// TODO: update with new body/typorm validation
export function ErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
	if (!error) return next();

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
			if (req.server?.options?.production) {
				message = "Internal Server Error";
			}
			code = httpcode = 500;
		}

		if (httpcode > 511) httpcode = 400;

		console.error(`[Error] ${code} ${req.url}`, errors || error, "body:", req.body);

		res.status(httpcode).json({ code: code, message, errors });
	} catch (error) {
		console.error(`[Internal Server Error] 500`, error);
		return res.status(500).json({ code: 500, message: "Internal Server Error" });
	}
}
