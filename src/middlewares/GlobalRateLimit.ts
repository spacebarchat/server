import { NextFunction, Request, Response } from "express";
import * as Config from '../util/Config'
import crypto from "crypto";

// TODO: use mongodb ttl index
// TODO: increment count on serverside

export async function GlobalRateLimit(req: Request, res: Response, next: NextFunction) {
	return next();
	// TODO: use new db mongoose models
	/*
	if (!Config.get().limits.rate.ip.enabled) return next();

	const ip = getIpAdress(req);
	let limit = (await db.data.ratelimit.global[ip].get()) || { start: Date.now(), count: 0 };
	if (limit.start < Date.now() - Config.get().limits.rate.ip.timespan) {
		limit.start = Date.now();
		limit.count = 0;
	}

	if (limit.count > Config.get().limits.rate.ip.count) {
		const timespan = Date.now() - limit.start;

		return res
			.set("Retry-After", `${timespan.toFixed(0)}`)
			.set("X-RateLimit-Global", "true")
			.status(429)
			.json({
				message: "You are being rate limited.",
				retry_after: timespan,
				global: true,
			});
	}

	res.once("close", async () => {
		if (res.statusCode >= 400) {
			limit.count++;
			await db.data.ratelimit.global[ip].set(limit);
		}
	});

	return next();
	*/
}

export function getIpAdress(req: Request): string {
	const rateLimitProperties = Config.apiConfig.get('security', {jwtSecret: crypto.randomBytes(256).toString("base64"), forwadedFor: null, captcha: {enabled:false, service: null, sitekey: null, secret: null}}) as Config.DefaultOptions;
	const { forwadedFor } = rateLimitProperties.security;
	const ip = forwadedFor ? <string>req.headers[forwadedFor] : req.ip;
	return ip.replaceAll(".", "_").replaceAll(":", "_");
}
