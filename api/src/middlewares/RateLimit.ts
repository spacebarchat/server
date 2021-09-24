import { Config, listenEvent } from "@fosscord/util";
import { NextFunction, Request, Response, Router } from "express";
import { getIpAdress } from "@fosscord/api";
import { API_PREFIX_TRAILING_SLASH } from "./Authentication";

// Docs: https://discord.com/developers/docs/topics/rate-limits

// TODO: use better caching (e.g. redis) as else it creates to much pressure on the database

/*
? bucket limit? Max actions/sec per bucket?

TODO: delay database requests to include multiple queries
TODO: different for methods (GET/POST)

> IP addresses that make too many invalid HTTP requests are automatically and temporarily restricted from accessing the Discord API. Currently, this limit is 10,000 per 10 minutes. An invalid request is one that results in 401, 403, or 429 statuses.

> All bots can make up to 50 requests per second to our API. This is independent of any individual rate limit on a route. If your bot gets big enough, based on its functionality, it may be impossible to stay below 50 requests per second during normal operations.

*/

type RateLimit = {
	id: "global" | "error" | string;
	executor_id: string;
	hits: number;
	blocked: boolean;
	expires_at: Date;
};

var Cache = new Map<string, RateLimit>();
const EventRateLimit = "RATELIMIT";

export default function rateLimit(opts: {
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
		var executor_id = getIpAdress(req);
		if (!opts.onlyIp && req.user_id) executor_id = req.user_id;

		var max_hits = opts.count;
		if (opts.bot && req.user_bot) max_hits = opts.bot;
		if (opts.GET && ["GET", "OPTIONS", "HEAD"].includes(req.method)) max_hits = opts.GET;
		else if (opts.MODIFY && ["POST", "DELETE", "PATCH", "PUT"].includes(req.method)) max_hits = opts.MODIFY;

		const offender = Cache.get(executor_id + bucket_id);

		if (offender) {
			const reset = offender.expires_at.getTime();
			const resetAfterMs = reset - Date.now();
			const resetAfterSec = resetAfterMs / 1000;

			if (resetAfterMs <= 0) {
				offender.hits = 0;
				offender.expires_at = new Date(Date.now() + opts.window * 1000);
				offender.blocked = false;

				Cache.delete(executor_id + bucket_id);
			}

			if (offender.blocked) {
				const global = bucket_id === "global";

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
			}
		}

		next();
		const hitRouteOpts = { bucket_id, executor_id, max_hits, window: opts.window };

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
	const { routes, global, ip, error, disabled } = Config.get().limits.rate;
	if (disabled) return;
	await listenEvent(EventRateLimit, (event) => {
		Cache.set(event.channel_id as string, event.data);
		event.acknowledge?.();
	});
	// await RateLimit.delete({ expires_at: LessThan(new Date().toISOString()) }); // cleans up if not already deleted, morethan -> older date
	// const limits = await RateLimit.find({ blocked: true });
	// limits.forEach((limit) => {
	// 	Cache.set(limit.executor_id, limit);
	// });

	setInterval(() => {
		Cache.forEach((x, key) => {
			if (new Date() > x.expires_at) {
				Cache.delete(key);
				// RateLimit.delete({ executor_id: key });
			}
		});
	}, 1000 * 60);

	app.use(
		rateLimit({
			bucket: "global",
			onlyIp: true,
			...ip
		})
	);
	app.use(rateLimit({ bucket: "global", ...global }));
	app.use(
		rateLimit({
			bucket: "error",
			error: true,
			onlyIp: true,
			...error
		})
	);
	app.use("/guilds/:id", rateLimit(routes.guild));
	app.use("/webhooks/:id", rateLimit(routes.webhook));
	app.use("/channels/:id", rateLimit(routes.channel));
	app.use("/auth/login", rateLimit(routes.auth.login));
	app.use("/auth/register", rateLimit({ onlyIp: true, success: true, ...routes.auth.register }));
}

async function hitRoute(opts: { executor_id: string; bucket_id: string; max_hits: number; window: number }) {
	const id = opts.executor_id + opts.bucket_id;
	var limit = Cache.get(id);
	if (!limit) {
		limit = {
			id: opts.bucket_id,
			executor_id: opts.executor_id,
			expires_at: new Date(Date.now() + opts.window * 1000),
			hits: 0,
			blocked: false
		};
		Cache.set(id, limit);
	}

	limit.hits++;
	if (limit.hits >= opts.max_hits) {
		limit.blocked = true;
	}

	/*
	var ratelimit = await RateLimit.findOne({ id: opts.bucket_id, executor_id: opts.executor_id });
	if (!ratelimit) {
		ratelimit = new RateLimit({
			id: opts.bucket_id,
			executor_id: opts.executor_id,
			expires_at: new Date(Date.now() + opts.window * 1000),
			hits: 0,
			blocked: false
		});
	}

	ratelimit.hits++;

	const updateBlock = !ratelimit.blocked && ratelimit.hits >= opts.max_hits;

	if (updateBlock) {
		ratelimit.blocked = true;
		Cache.set(opts.executor_id + opts.bucket_id, ratelimit);
		await emitEvent({
			channel_id: EventRateLimit,
			event: EventRateLimit,
			data: ratelimit
		});
	} else {
		Cache.delete(opts.executor_id);
	}

	await ratelimit.save();
	*/
}
