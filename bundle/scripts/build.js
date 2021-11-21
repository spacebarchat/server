const { execSync } = require("child_process");
const path = require("path");
const fse = require("fs-extra");
const { getSystemErrorMap } = require("util");
const { argv } = require("process");

const dirs = ["api", "util", "cdn", "gateway", "bundle"];

const verbose = argv.includes("verbose") || argv.includes("v");

if (argv.includes("clean")) {
	dirs.forEach((a) => {
		var d = "../" + a + "/dist";
		if (fse.existsSync(d)) {
			fse.rmSync(d, { recursive: true });
			if (verbose) console.log(`Deleted ${d}!`);
		}
	});
}

fse.copySync(path.join(__dirname, "..", "..", "api", "assets"), path.join(__dirname, "..", "dist", "api", "assets"));
fse.copySync(path.join(__dirname, "..", "..", "api", "client_test"), path.join(__dirname, "..", "dist", "api", "client_test"));
fse.copySync(path.join(__dirname, "..", "..", "api", "locales"), path.join(__dirname, "..", "dist", "api", "locales"));
dirs.forEach((a) => {
	fse.copySync("../" + a + "/src", "dist/" + a + "/src");
	if (verbose) console.log(`Copied ${"../" + a + "/dist"} -> ${"dist/" + a + "/src"}!`);
});

console.log("Copying src files done");
if (!argv.includes("copyonly")) {
	console.log("Compiling src files ...");

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
