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

import bodyParser, { OptionsJson } from "body-parser";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";

const errorMessages: { [key: string]: [string, number] } = {
	"entity.too.large": ["Request body too large", 413],
	"entity.parse.failed": ["Invalid JSON body", 400],
	"entity.verify.failed": ["Entity verification failed", 403],
	"request.aborted": ["Request aborted", 400],
	"request.size.invalid": ["Request size did not match content length", 400],
	"stream.encoding.set": ["Stream encoding should not be set", 500],
	"stream.not.readable": ["Stream is not readable", 500],
	"parameters.too.many": ["Too many parameters", 413],
	"charset.unsupported": ["Unsupported charset", 415],
	"encoding.unsupported": ["Unsupported content encoding", 415],
};

export function BodyParser(opts?: OptionsJson) {
	const jsonParser = bodyParser.json(opts);

	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.headers["content-type"])
			req.headers["content-type"] = "application/json";

		jsonParser(req, res, (err) => {
			if (err) {
				const [message, status] = errorMessages[err.type] || [
					"Invalid Body",
					400,
				];
				const errorMessage =
					message.includes("charset") || message.includes("encoding")
						? `${message} "${err.charset || err.encoding}"`
						: message;
				return next(new HTTPError(errorMessage, status));
			}
			next();
		});
	};
}
