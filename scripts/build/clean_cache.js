const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log(`==> Cleaning asset cache...`);
	const assetDir = path.resolve(path.join(config.rootDir, "assets", "cache"));
	if (fs.existsSync(assetDir)) {
		fs.rmSync(assetDir, { recursive: true });
		if (config.verbose) console.log(`Deleted ${assetDir}!`);
	}
};
