import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import Config from "../util/Config";
import { JWTOptions } from "../util/Constants";

export const NO_AUTHORIZATION_ROUTES = ["/api/v8/auth/login", "/api/v8/auth/register"];

declare global {
	namespace Express {
		interface Request {
			userid: any;
			token: any;
		}
	}
}

export function Authentication(req: Request, res: Response, next: NextFunction) {
	if (NO_AUTHORIZATION_ROUTES.includes(req.url)) return next();
	if (!req.headers.authorization) return next(new HTTPError("Missing Authorization Header", 401));

	return jwt.verify(req.headers.authorization, Config.get().server.jwtSecret, JWTOptions, (err, decoded: any) => {
		if (err || !decoded) return next(new HTTPError("Invalid Token", 401));

		req.token = decoded;
		req.userid = decoded.id;

		return next();
	});
}
