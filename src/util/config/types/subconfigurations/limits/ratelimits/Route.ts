import { AuthRateLimit } from ".";
import { RateLimitOptions } from "./RateLimitOptions";

export class RouteRateLimit {
	guild: RateLimitOptions = {
		count: 5,
		window: 5
	};
	webhook: RateLimitOptions = {
		count: 10,
		window: 5
	};
	channel: RateLimitOptions = {
		count: 10,
		window: 5
	};
	auth: AuthRateLimit = new AuthRateLimit();
	// TODO: rate limit configuration for all routes
}
