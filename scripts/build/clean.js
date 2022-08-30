const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	if (fs.existsSync(config.buildLog)) fs.rmSync(config.buildLog);
	if (fs.existsSync(config.buildLogAnsi)) fs.rmSync(config.buildLogAnsi);

	if (config.clean) {
		console.log(`==> Cleaning...`);
		if (fs.existsSync(config.distDir)) {
			fs.rmSync(config.distDir, { recursive: true });
			if (config.verbose) console.log(`Deleted ${path.resolve(config.distDir)}!`);
		}
	}
};
