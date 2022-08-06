const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { getSystemErrorMap } = require("util");
const { argv, stdout, exit } = require("process");
const {copyRecursiveSync,execIn} = require('./utils');

if(argv.includes("help")) {
	console.log(`Fosscord build script help:

Arguments:
  clean			Cleans up previous builds
  copyonly		Only copy source files, don't build (useful for updating assets)
  verbose		Enable verbose logging
  logerrors		Log build errors to console
  pretty-errors		Pretty-print build errors`);
	exit(0);
}

let steps = 3, i = 0;
if (argv.includes("clean")) steps++;
if (argv.includes("copyonly")) steps--;
const dirs = ["api", "util", "cdn", "gateway", "bundle"];

const verbose = argv.includes("verbose") || argv.includes("v");

if (argv.includes("clean")) {
	console.log(`[${++i}/${steps}] Cleaning...`);
	dirs.forEach((a) => {
		let d = "../" + a + "/dist";
		if (fs.existsSync(d)) {
			fs.rmSync(d, { recursive: true });
			if (verbose) console.log(`Deleted ${d}!`);
		}
	});
}

console.log(`[${++i}/${steps}] Checking if dependencies were installed correctly...`);
//exif-be-gone v1.3.0 doesnt build js, known bug
if(!fs.existsSync(path.join(__dirname, "..", "node_modules", "exif-be-gone", "index.js")))
	execIn("npm run build", path.join(__dirname, "..", "node_modules", "exif-be-gone"));

console.log(`[${++i}/${steps}] Copying src files...`);
copyRecursiveSync(path.join(__dirname, "..", "..", "api", "assets"), path.join(__dirname, "..", "dist", "api", "assets"));
copyRecursiveSync(path.join(__dirname, "..", "..", "api", "client_test"), path.join(__dirname, "..", "dist", "api", "client_test"));
copyRecursiveSync(path.join(__dirname, "..", "..", "api", "locales"), path.join(__dirname, "..", "dist", "api", "locales"));
dirs.forEach((a) => {
	copyRecursiveSync("../" + a + "/src", "dist/" + a + "/src");
	if (verbose) console.log(`Copied ${"../" + a + "/dist"} -> ${"dist/" + a + "/src"}!`);
});

if (!argv.includes("copyonly")) {
	console.log(`[${++i}/${steps}] Compiling src files ...`);

	console.log(
		execSync(
			'node "' +
				path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsc.js") +
				'" -p "' +
				path.join(__dirname, "..") +
				'"',
			{
				cwd: path.join(__dirname, ".."),
				shell: true,
				env: process.env,
				encoding: "utf8"
			}
		)
	);
}

