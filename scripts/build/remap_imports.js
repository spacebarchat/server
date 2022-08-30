const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log(`==> Remapping module imports...`);
	let files = walk(config.distDir).filter((x) => x.endsWith(".js"));
	files.forEach((x) => {
		let fc = fs.readFileSync(x).toString();
		fc = fc.replaceAll("@fosscord/", "#");
		fs.writeFileSync(x, fc);
	});
};
