import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { checkToken } from "fosscord-server-util";

export const NO_AUTHORIZATION_ROUTES = ["/api/v8/auth/login", "/api/v8/auth/register", "/api/v8/webhooks/"];

declare global {
	namespace Express {
		interface Request {
			userid: any;
			token: any;
		}
	}
}

export async function Authentication(req: Request, res: Response, next: NextFunction) {
	if (NO_AUTHORIZATION_ROUTES.some((x) => req.url.startsWith(x))) return next();
	if (!req.headers.authorization) return next(new HTTPError("Missing Authorization Header", 401));
	// TODO: check if user is banned/token expired

	try {
		const decoded: any = await checkToken(req.headers.authorization);

		req.token = decoded;
		req.userid = BigInt(decoded.id);
		return next();
	} catch (error) {
		return next(new HTTPError(error.toString(), 400));
	}
}
