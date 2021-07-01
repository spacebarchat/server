import { db, MongooseCache, Bucket } from "@fosscord/server-util";
import { NextFunction, Request, Response } from "express";
import { API_PREFIX, API_PREFIX_TRAILING_SLASH } from "./Authentication";

const Cache = new MongooseCache(db.collection("ratelimits"), [{ $match: { blocked: true } }], { onlyEvents: false, array: true });

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
		const bucket_id = req.path.replace(API_PREFIX_TRAILING_SLASH, "");
		const user_id = req.user_id;
		const max_hits = req.user_bot ? opts.bot : opts.count;
		const offender = Cache.data.find((x: Bucket) => x.user && x.id === bucket_id) as Bucket | null;

		if (offender && offender.blocked) {
			const reset = offender.created_at.getTime() + opts.window;
			const resetAfterMs = reset - Date.now();
			const resetAfterSec = resetAfterMs / 1000;
			const global = bucket_id === "global";

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
		}
		next();
		console.log(req.route);

		if (opts.error) {
			res.once("finish", () => {
				// check if error and increment error rate limit
			});
		}

		db.collection("ratelimits").updateOne(
			{ bucket: bucket_id },
			{
				$set: {
					id: bucket_id,
					user_id,
					created_at: new Date(),
					$cond: { if: { $gt: ["$hits", max_hits] }, then: true, else: false }
				},
				$inc: { hits: 1 }
			},
			{ upsert: true }
		);
	};
}
