import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { ApiError, FieldError } from "@fosscord/util";
const EntityNotFoundErrorRegex = /"(\w+)"/;

export function ErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
	if (!error) return next();

	try {
		let code = 400;
		let httpcode = code;
		let message = error?.toString();
		let errors = undefined;

		if (error instanceof HTTPError && error.code) code = httpcode = error.code;
		else if (error instanceof ApiError) {
			code = error.code;
			message = error.message;
			httpcode = error.httpStatus;
		} else if (error.name === "EntityNotFoundError") {
			message = `${error.message.match(EntityNotFoundErrorRegex)?.[1] || "Item"} could not be found`;
			code = httpcode = 404;
		} else if (error instanceof FieldError) {
			code = Number(error.code);
			message = error.message;
			errors = error.errors;
		} else {
			console.error(`[Error] ${code} ${req.url}\n`, errors || error, "\nbody:", req.body);

			if (req.server?.options?.production) {
				// don't expose internal errors to the user, instead human errors should be thrown as HTTPError
				message = "Internal Server Error";
			}
			code = httpcode = 500;
		}

		if (httpcode > 511) httpcode = 400;

		res.status(httpcode).json({ code: code, message, errors });
	} catch (error) {
		console.error(`[Internal Server Error] 500`, error);
		return res.status(500).json({ code: 500, message: "Internal Server Error" });
	}
}
