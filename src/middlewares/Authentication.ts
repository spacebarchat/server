import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { checkToken, Config } from "@fosscord/server-util";

export const NO_AUTHORIZATION_ROUTES = [
	/^\/api\/v8\/auth\/login/,
	/^\/api\/v8\/auth\/register/,
	/^\/api\/v8\/webhooks\//,
	/^\/api\/v8\/gateway/,
	/^\/api\/v8\/experiments/,
	/^\/api(\/v\d+)?\/guilds\/\d+\/widget\.(json|png)/
];

declare global {
	namespace Express {
		interface Request {
			user_id: any;
			token: any;
		}
	}
}

export async function Authentication(req: Request, res: Response, next: NextFunction) {
	if (!req.url.startsWith("/api")) return next();
	if (req.url.startsWith("/api/v8/invites") && req.method === "GET") return next();
	if (NO_AUTHORIZATION_ROUTES.some((x) => x.test(req.url))) return next();
	if (!req.headers.authorization) return next(new HTTPError("Missing Authorization Header", 401));

	try {
		const { jwtSecret } = Config.get().security;

		const decoded: any = await checkToken(req.headers.authorization, jwtSecret);

		req.token = decoded;
		req.user_id = decoded.id;
		return next();
	} catch (error) {
		return next(new HTTPError(error.toString(), 400));
	}
}
