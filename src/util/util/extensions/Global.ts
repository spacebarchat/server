declare global {
	function sleep(ms: number): Promise<void>;
}

export function globalSleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

if (!globalThis.sleep) {
	globalThis.sleep = function (ms: number): Promise<void> {
		return globalSleep(ms);
	};
}

export {};
