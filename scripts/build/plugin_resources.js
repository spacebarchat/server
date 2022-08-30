const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log(`==> Copying all plugin resources...`);
	let pluginFiles = walk(config.pluginDir).filter((x) => !x.endsWith(".ts"));
	pluginFiles.forEach((x) => {
		fs.copyFileSync(x, x.replace("src", "dist"));
	});
};
