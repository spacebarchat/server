import { db, MongooseCache } from "@fosscord/server-util";
import { NextFunction, Request, Response } from "express";

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

export default function RateLimit(opts: { bucket?: string; window: number; count: number }) {
	Cache.init(); // will only initalize it once

	return async (req: Request, res: Response, next: NextFunction) => {
		next();
	};
}
