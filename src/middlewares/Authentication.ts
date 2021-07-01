import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { checkToken, Config } from "@fosscord/server-util";

export const NO_AUTHORIZATION_ROUTES = [
	/^\/api(\/v\d+)?\/auth\/login/,
	/^\/api(\/v\d+)?\/auth\/register/,
	/^\/api(\/v\d+)?\/webhooks\//,
	/^\/api(\/v\d+)?\/gateway/,
	/^\/api(\/v\d+)?\/experiments/,
	/^\/api(\/v\d+)?\/guilds\/\d+\/widget\.(json|png)/
];

export const API_PREFIX = /^\/api(\/v\d+)?/;
export const API_PREFIX_TRAILING_SLASH = /^\/api(\/v\d+)?\//;

declare global {
	namespace Express {
		interface Request {
			user_id: any;
			user_bot: boolean;
			token: any;
		}
	}
}

export async function Authentication(req: Request, res: Response, next: NextFunction) {
	if (req.method === "OPTIONS") return res.sendStatus(204);
	if (!req.url.startsWith("/api")) return next();
	const apiPath = req.url.replace(API_PREFIX, "");
	if (apiPath.startsWith("/invites") && req.method === "GET") return next();
	if (NO_AUTHORIZATION_ROUTES.some((x) => x.test(req.url))) return next();
	if (!req.headers.authorization) return next(new HTTPError("Missing Authorization Header", 401));

	try {
		const { jwtSecret } = Config.get().security;

		const { decoded, user }: any = await checkToken(req.headers.authorization, jwtSecret);

		req.token = decoded;
		req.user_id = decoded.id;
		req.user_bot = user.bot;
		return next();
	} catch (error) {
		return next(new HTTPError(error.toString(), 400));
	}
}
