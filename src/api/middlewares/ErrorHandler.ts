/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { ApiError, FieldError } from "@spacebar/util";
const EntityNotFoundErrorRegex = /"(\w+)"/;

export function ErrorHandler(
	error: Error & { type?: string },
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (!error) return next();

	try {
		let code = 400;
		let httpcode = code;
		let message = error?.toString();
		let errors = null;
		let data = null;

		if (error instanceof HTTPError && error.code) {
			code = httpcode = error.code;
			// @ts-expect-error - we make it exist
			if (error.data) data = error.data;
		} else if (error instanceof ApiError) {
			code = error.code;
			message = error.message;
			httpcode = error.httpStatus;
		} else if (error.name === "EntityNotFoundError") {
			message = `${
				error.message.match(EntityNotFoundErrorRegex)?.[1] || "Item"
			} could not be found`;
			code = httpcode = 404;
		} else if (error instanceof FieldError) {
			code = Number(error.code);
			message = error.message;
			errors = error.errors;
		} else if (error?.type == "entity.parse.failed") {
			// body-parser failed
			httpcode = 400;
			code = 50109;
			message = "The request body contains invalid JSON.";
		} else {
			console.error(
				`[Error] ${code} ${req.url}\n`,
				errors || error,
				"\nbody:",
				req.body,
			);

			if (req.server?.options?.production) {
				// don't expose internal errors to the user, instead human errors should be thrown as HTTPError
				message = "Internal Server Error";
			}
			code = httpcode = 500;
		}

		if (httpcode > 511) httpcode = 400;

		res.status(httpcode).json({ code: code, message, errors, data });
	} catch (error) {
		console.error(`[Internal Server Error] 500`, error);
		return res
			.status(500)
			.json({ code: 500, message: "Internal Server Error" });
	}
}
