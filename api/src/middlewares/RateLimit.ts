// @ts-nocheck
import { db, Bucket, Config, listenEvent, emitEvent } from "@fosscord/util";
import { NextFunction, Request, Response, Router } from "express";
import { getIpAdress } from "../util/ipAddress";
import { API_PREFIX_TRAILING_SLASH } from "./Authentication";

// Docs: https://discord.com/developers/docs/topics/rate-limits

/*
? bucket limit? Max actions/sec per bucket?

TODO: delay database requests to include multiple queries
TODO: different for methods (GET/POST)

> IP addresses that make too many invalid HTTP requests are automatically and temporarily restricted from accessing the Discord API. Currently, this limit is 10,000 per 10 minutes. An invalid request is one that results in 401, 403, or 429 statuses.

> All bots can make up to 50 requests per second to our API. This is independent of any individual rate limit on a route. If your bot gets big enough, based on its functionality, it may be impossible to stay below 50 requests per second during normal operations.

*/

var Cache = new Map<string, Bucket>();
const EventRateLimit = "ratelimit";

export default function RateLimit(opts: {
	bucket?: string;
	window: number;
	count: number;
	bot?: number;
	webhook?: number;
	oauth?: number;
	GET?: number;
	MODIFY?: number;
	error?: boolean;
	success?: boolean;
	onlyIp?: boolean;
}): any {
	return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		const bucket_id = opts.bucket || req.originalUrl.replace(API_PREFIX_TRAILING_SLASH, "");
		var user_id = getIpAdress(req);
		if (!opts.onlyIp && req.user_id) user_id = req.user_id;

		var max_hits = opts.count;
		if (opts.bot && req.user_bot) max_hits = opts.bot;
		if (opts.GET && ["GET", "OPTIONS", "HEAD"].includes(req.method)) max_hits = opts.GET;
		else if (opts.MODIFY && ["POST", "DELETE", "PATCH", "PUT"].includes(req.method)) max_hits = opts.MODIFY;

		const offender = Cache.get(user_id + bucket_id) as Bucket | null;

		if (offender && offender.blocked) {
			const reset = offender.expires_at.getTime();
			const resetAfterMs = reset - Date.now();
			const resetAfterSec = resetAfterMs / 1000;
			const global = bucket_id === "global";

			if (resetAfterMs > 0) {
				console.log("blocked bucket: " + bucket_id, { resetAfterMs });
				return (
					res
						.status(429)
						.set("X-RateLimit-Limit", `${max_hits}`)
						.set("X-RateLimit-Remaining", "0")
						.set("X-RateLimit-Reset", `${reset}`)
						.set("X-RateLimit-Reset-After", `${resetAfterSec}`)
						.set("X-RateLimit-Global", `${global}`)
						.set("Retry-After", `${Math.ceil(resetAfterSec)}`)
						.set("X-RateLimit-Bucket", `${bucket_id}`)
						// TODO: error rate limit message translation
						.send({ message: "You are being rate limited.", retry_after: resetAfterSec, global })
				);
			} else {
				offender.hits = 0;
				offender.expires_at = new Date(Date.now() + opts.window * 1000);
				offender.blocked = false;
				// mongodb ttl didn't update yet -> manually update/delete
				db.collection("ratelimits").updateOne({ id: bucket_id, user_id }, { $set: offender });
				Cache.delete(user_id + bucket_id);
			}
		}
		next();
		const hitRouteOpts = { bucket_id, user_id, max_hits, window: opts.window };

		if (opts.error || opts.success) {
			res.once("finish", () => {
				// check if error and increment error rate limit
				if (res.statusCode >= 400 && opts.error) {
					return hitRoute(hitRouteOpts);
				} else if (res.statusCode >= 200 && res.statusCode < 300 && opts.success) {
					return hitRoute(hitRouteOpts);
				}
			});
		} else {
			return hitRoute(hitRouteOpts);
		}
	};
}

export async function initRateLimits(app: Router) {
	const { routes, global, ip, error } = Config.get().limits.rate;
	await listenEvent(EventRateLimit, (event) => {
		Cache.set(event.channel_id, event.data);
		event.acknowledge?.();
	});

	setInterval(() => {
		Cache.forEach((x, key) => {
			if (Date.now() > x.expires_at) Cache.delete(key);
		});
	}, 1000 * 60 * 10);

	app.use(
		RateLimit({
			bucket: "global",
			onlyIp: true,
			...ip
		})
	);
	app.use(RateLimit({ bucket: "global", ...global }));
	app.use(
		RateLimit({
			bucket: "error",
			error: true,
			onlyIp: true,
			...error
		})
	);
	app.use("/guilds/:id", RateLimit(routes.guild));
	app.use("/webhooks/:id", RateLimit(routes.webhook));
	app.use("/channels/:id", RateLimit(routes.channel));
	app.use("/auth/login", RateLimit(routes.auth.login));
	app.use("/auth/register", RateLimit({ onlyIp: true, success: true, ...routes.auth.register }));
}

async function hitRoute(opts: { user_id: string; bucket_id: string; max_hits: number; window: number }) {
	const filter = { id: opts.bucket_id, user_id: opts.user_id };
	const { value } = await db.collection("ratelimits").findOneAndUpdate(
		filter,
		{
			$setOnInsert: {
				id: opts.bucket_id,
				user_id: opts.user_id,
				expires_at: new Date(Date.now() + opts.window * 1000)
			},
			$inc: {
				hits: 1
			}
			// Conditionally update blocked doesn't work
		},
		{ upsert: true, returnDocument: "before" }
	);
	if (!value) return;
	const updateBlock = !value.blocked && value.hits >= opts.max_hits;

	if (updateBlock) {
		value.blocked = true;
		Cache.set(opts.user_id + opts.bucket_id, value);
		await emitEvent({
			channel_id: EventRateLimit,
			event: EventRateLimit,
			data: value
		});
		await db.collection("ratelimits").updateOne(filter, { $set: { blocked: true } });
	} else {
		Cache.delete(opts.user_id);
	}
}
