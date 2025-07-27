const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("./utils");

if (argv.includes("help")) {
	console.log(`Fosscord build script help:
Arguments:
  clean			Cleans up previous builds
  verbose		Enable verbose logging
  logerrors		Log build errors to console
  pretty-errors		Pretty-print build errors
  silent		No output to console or files.
  propagate-err	Exit script with error code if build fails.`);
	exit(0);
}

let steps = 5,
	i = 0;
if (argv.includes("clean")) steps++;

const verbose = argv.includes("verbose") || argv.includes("v");
const logerr = argv.includes("logerrors");
const pretty = argv.includes("pretty-errors");
const silent = argv.includes("silent");

if (silent) console.error = console.log = function () {};

if (argv.includes("clean")) {
	console.log(`[${++i}/${steps}] Cleaning...`);
	let d = "../" + "/dist";
		if (fs.existsSync(d)) {
			fs.rmSync(d, { recursive: true });
			if (verbose) console.log(`Deleted ${d}!`);
		}
}

console.log(`[${++i}/${steps}] Compiling src files ...`);

let buildFlags = "";
if (pretty) buildFlags += "--pretty ";

console.log(`[${++i}/${steps}] Building plugin index...`);
let pluginDir = path.join(__dirname, "..", "src", "plugins");
let output = 'import { Plugin } from "util/plugin";\n';

const dirs = fs.readdirSync(pluginDir).filter((x) => {
	try {
		fs.readdirSync(path.join(pluginDir, x));
		return true;
	} catch (e) {
		return false;
	}
});
dirs.forEach((x) => {
	let pluginManifest = require(path.join(pluginDir, x, "plugin.json"));
	output += `import * as ${sanitizeVarName(x)} from "./${x}/${pluginManifest.mainClass}";\n`;
});
output += `\nexport const PluginIndex: any = {\n`;
dirs.forEach((x) => {
	output += `    "${x}": new ${sanitizeVarName(x)}.default(),\n`; //ctor test: '${path.resolve(path.join(pluginDir, x))}', require('./${x}/plugin.json')
});
output += `};`;

fs.writeFileSync(path.join(__dirname, "..", "src", "plugins", "PluginIndex.ts"), output);

if (!argv.includes("copyonly")) {
	console.log(`[${++i}/${steps}] Compiling source code...`);

	let buildFlags = "";
	if (pretty) buildFlags += "--pretty ";

	try {
		execSync(
			'node "' +
				path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsc.js") +
				'" -p "' +
				path.join(__dirname, "..") +
				'" ' +
				buildFlags,
			{
				cwd: path.join(__dirname, ".."),
				shell: true,
				env: process.env,
				encoding: "utf8"
			}
		);
	} catch (error) {
		if (verbose || logerr) {
			error.stdout.split(/\r?\n/).forEach((line) => {
				let _line = line.replace("dist/", "", 1);
				if (!pretty && _line.includes(".ts(")) {
					//reformat file path for easy jumping
					_line = _line.replace("(", ":", 1).replace(",", ":", 1).replace(")", "", 1);
				}
				console.error(_line);
			});
		}
		console.error(`Build failed! Please check build.log for info!`);
		if (!silent) {
			if (pretty) fs.writeFileSync("build.log.ansi", error.stdout);
			fs.writeFileSync(
				"build.log",
				error.stdout.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")
			);
		}
		throw error;
	}
}

console.log(`[${++i}/${steps}] Copying plugin data...`);
let pluginFiles = walk(pluginDir).filter((x) => !x.endsWith(".ts"));
pluginFiles.forEach((x) => {
	fs.copyFileSync(x, x.replace("src", "dist"));
});
