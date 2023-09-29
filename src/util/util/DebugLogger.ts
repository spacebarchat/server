export const Debug = (module: string, ...args: unknown[]) => {
	if (process.env["DEBUG_LOGGING"]) {
		console.log(`[${module}]`, ...args);
	}
};
