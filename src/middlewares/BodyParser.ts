import bodyParser, { OptionsJson } from "body-parser";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";

export function BodyParser(opts?: OptionsJson) {
	const jsonParser = bodyParser.json(opts);

	return (req: Request, res: Response, next: NextFunction) => {
		jsonParser(req, res, (err) => {
			if (err) {
				// TODO: different errors for body parser (request size limit, wrong body type, invalid body, ...)
				return next(new HTTPError("Invalid Body", 400));
			}
			next();
		});
	};
}
