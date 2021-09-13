const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require("path");

// fs.unlinkSync(path.join(__dirname, "..", "database.db"));

global.expect.extend({
	toBeFasterThan: async (func, target) => {
		const start = performance.now();
		var error;
		try {
			await func();
		} catch (e) {
			error = e.toString();
		}
		const time = performance.now() - start;

		return {
			pass: time < target && !error,
			message: () => error || `${func.name} took ${time}ms of maximum ${target}`,
		};
	},
});
