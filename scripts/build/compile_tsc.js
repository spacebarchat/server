const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log("==> Compiling source with tsc...");
	let buildFlags = "";
	if (config.pretty) buildFlags += "--pretty ";

	try {
		execSync(
			'node "' +
				path.join(config.rootDir, "node_modules", "typescript", "lib", "tsc.js") +
				'" -p "' +
				path.join(config.rootDir) +
				'" ' +
				buildFlags,
			{
				cwd: path.join(config.rootDir),
				shell: true,
				env: process.env,
				encoding: "utf8"
			}
		);
	} catch (error) {
		if (config.verbose || config.logerr) {
			error.stdout.split(/\r?\n/).forEach((line) => {
				let _line = line.replace("dist/", "", 1);
				if (!config.pretty && _line.includes(".ts(")) {
					//reformat file path for easy jumping
					_line = _line.replace("(", ":", 1).replace(",", ":", 1).replace(")", "", 1);
				}
				console.error(_line);
			});
		}
		console.error(`Build failed! Please check build.log for info!`);
		if (!config.silent) {
			if (config.pretty) fs.writeFileSync(path.join(config.rootDir, "build.log.ansi"), error.stdout);
			fs.writeFileSync(
				path.join(config.rootDir, "build.log"),
				error.stdout.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")
			);
		}
		throw error;
	}
};
