import { RateLimitOptions } from "./RateLimitOptions";

export class AuthRateLimit {
	login: RateLimitOptions = {
		count: 5,
		window: 60,
	};
	register: RateLimitOptions = {
		count: 2,
		window: 60 * 60 * 12,
	};
}
