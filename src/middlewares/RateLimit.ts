import { db, MongooseCache, Bucket } from "@fosscord/server-util";
import { NextFunction, Request, Response } from "express";
import { getIpAdress } from "../util/ipAddress";
import { API_PREFIX_TRAILING_SLASH } from "./Authentication";

const Cache = new MongooseCache(
	db.collection("ratelimits"),
	[
		// TODO: uncomment $match and fix error: not receiving change events
		// { $match: { blocked: true } }
	],
	{ onlyEvents: false, array: true }
);

// Docs: https://discord.com/developers/docs/topics/rate-limits

/*
? bucket limit? Max actions/sec per bucket?

TODO: ip rate limit
TODO: user rate limit
TODO: different rate limit for bots/user/oauth/webhook
TODO: delay database requests to include multiple queries
TODO: different for methods (GET/POST)
TODO: bucket major parameters (channel_id, guild_id, webhook_id)
TODO: use config values

> IP addresses that make too many invalid HTTP requests are automatically and temporarily restricted from accessing the Discord API. Currently, this limit is 10,000 per 10 minutes. An invalid request is one that results in 401, 403, or 429 statuses.

> All bots can make up to 50 requests per second to our API. This is independent of any individual rate limit on a route. If your bot gets big enough, based on its functionality, it may be impossible to stay below 50 requests per second during normal operations.

*/

export default function RateLimit(opts: {
	bucket?: string;
	window: number;
	count: number;
	bot?: number;
	error?: number;
	webhook?: number;
	oauth?: number;
	GET?: number;
	MODIFY?: number;
}) {
	Cache.init(); // will only initalize it once

	return async (req: Request, res: Response, next: NextFunction) => {
		const bucket_id = opts.bucket || req.path.replace(API_PREFIX_TRAILING_SLASH, "");
		const user_id = req.user_id || getIpAdress(req);
		var max_hits = opts.count;
		if (opts.bot && req.user_bot) max_hits = opts.bot;
		if (opts.GET && ["GET", "OPTIONS", "HEAD"].includes(req.method)) max_hits = opts.GET;
		else if (opts.MODIFY && ["POST", "DELETE", "PATCH", "PUT"].includes(req.method)) max_hits = opts.MODIFY;

		const offender = Cache.data?.find((x: Bucket) => x.user_id == user_id && x.id === bucket_id) as Bucket | null;

		if (offender && offender.blocked) {
			const reset = offender.expires_at.getTime();
			const resetAfterMs = reset - Date.now();
			const resetAfterSec = resetAfterMs / 1000;
			const global = bucket_id === "global";
			console.log("blocked", { resetAfterMs });

			if (resetAfterMs > 0) {
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
				// mongodb ttl didn't update yet -> manually update/delete
				db.collection("ratelimits").updateOne(
					{ id: bucket_id, user_id },
					{ $set: { hits: 0, expires_at: new Date(Date.now() + opts.window * 1000), blocked: false } }
				);
			}
		}
		next();

		if (opts.error) {
			res.once("finish", () => {
				// check if error and increment error rate limit
				if (res.statusCode >= 400) {
					// TODO: use config rate limit values
					return hitRoute({ bucket_id: "error", user_id, max_hits: opts.error as number, window: opts.window });
				}
			});
		}

		return hitRoute({ user_id, bucket_id, max_hits, window: opts.window });
	};
}

function hitRoute(opts: { user_id: string; bucket_id: string; max_hits: number; window: number }) {
	return db.collection("ratelimits").updateOne(
		{ id: opts.bucket_id, user_id: opts.user_id },
		[
			{
				$replaceRoot: {
					newRoot: {
						// similar to $setOnInsert
						$mergeObjects: [
							{
								id: opts.bucket_id,
								user_id: opts.user_id,
								expires_at: new Date(Date.now() + opts.window * 1000)
							},
							"$$ROOT"
						]
					}
				}
			},
			{
				$set: {
					hits: { $sum: [{ $ifNull: ["$hits", 0] }, 1] },
					blocked: { $gt: ["$hits", opts.max_hits] }
				}
			}
		],
		{ upsert: true }
	);
}
