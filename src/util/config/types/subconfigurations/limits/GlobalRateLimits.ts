export class GlobalRateLimits {
	register: GlobalRateLimit = { limit: 25, window: 60 * 60 * 1000, enabled: true };
	sendMessage: GlobalRateLimit = { limit: 200, window: 60 * 1000, enabled: true };
}

export class GlobalRateLimit {
	limit: number = 100;
	window: number = 60 * 60 * 1000;
	enabled: boolean = true;
}
