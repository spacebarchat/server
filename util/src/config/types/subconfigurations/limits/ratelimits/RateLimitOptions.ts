export interface RateLimitOptions {
	bot?: number;
	count: number;
	window: number;
	onyIp?: boolean;
}