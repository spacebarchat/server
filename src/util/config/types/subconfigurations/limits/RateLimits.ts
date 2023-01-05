import { RouteRateLimit, RateLimitOptions } from ".";

export class RateLimits {
	enabled: boolean = false;
	ip: Omit<RateLimitOptions, "bot_count"> = {
		count: 500,
		window: 5,
	};
	global: RateLimitOptions = {
		count: 250,
		window: 5,
	};
	error: RateLimitOptions = {
		count: 10,
		window: 5,
	};
	routes: RouteRateLimit = new RouteRateLimit();
}
