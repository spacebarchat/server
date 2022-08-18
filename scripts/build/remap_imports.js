const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log(`==> Remapping module imports...`);
	Object.keys(config.paths).forEach((mod) => {
		let files = walk(config.distDir).filter((x) => x.endsWith(".js"));
		files.forEach((x) => {
			let fc = fs.readFileSync(x).toString();
			if (fc.includes(mod)) {
				//find relative path to other directory
				let relPath = path.relative(x, path.resolve(path.join(config.distDir, config.paths[mod])));
				if (config.verbose) console.log(`  ==> Remapping import of ${mod} to ${relPath} in ${path.relative(config.distDir, x)}`);
				fc = fc.replace(mod, relPath);
				fs.writeFileSync(x, fc);
			}
		});
	});
};
