import { RateLimitOptions, RouteRateLimit } from ".";

export class RateLimits {
	disabled: boolean = true;
	ip: Omit<RateLimitOptions, "bot_count"> = {
		count: 500,
		window: 5
	};
	global: RateLimitOptions = {
		count: 250,
		window: 5
	};
	error: RateLimitOptions = {
		count: 10,
		window: 5
	};
	routes: RouteRateLimit;
}
