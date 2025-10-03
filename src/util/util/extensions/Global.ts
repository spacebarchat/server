declare global {
	function sleep(ms: number): Promise<void>;
}

if (!globalThis.sleep) {
	globalThis.sleep = function (ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};
}

export {};
