const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log(`==> Copying all util resources...`);
	let utilRes = walk(path.join(config.srcDir, "api", "routes-util")).filter((x) => !x.endsWith(".ts"));
	utilRes.forEach((x) => {
		fs.copyFileSync(x, x.replace("src", "dist"));
	});
	console.log(`==> Cleaning util resources...`);
	let dirt = walk(path.join(config.distDir, "api", "routes-util")).filter((x) => x.endsWith(".ts") || x.endsWith(".js.map") || x.endsWith(".d.ts"));
	dirt.forEach((x) => {
		fs.rmSync(x, { force: true });
	});
	
};
