const { execSync } = require("child_process");
const path = require("path");
const fse = require("fs-extra");
const fs = require("fs");
const { getSystemErrorMap } = require("util");
const { argv } = require("process");

const dirs = ["api", "util", "cdn", "gateway", "bundle"];

const verbose = argv.includes("verbose") || argv.includes("v");

var copyRecursiveSync = function(src, dest) {
	if(verbose) console.log(`cpsync: ${src} -> ${dest}`);
	var exists = fs.existsSync(src);
	if(!exists){
		console.log(src + " doesn't exist, not copying!");
		return;
	}
	var stats = exists && fs.statSync(src);
	var isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
	  fs.mkdirSync(dest, {recursive: true});
	  fs.readdirSync(src).forEach(function(childItemName) {
		copyRecursiveSync(path.join(src, childItemName),
						  path.join(dest, childItemName));
	  });
	} else {
	  fs.copyFileSync(src, dest);
	}
  };

if (argv.includes("clean")) {
	dirs.forEach((a) => {
		var d = "../" + a + "/dist";
		if (fs.existsSync(d)) {
			fs.rmSync(d, { recursive: true });
			if (verbose) console.log(`Deleted ${d}!`);
		}
	});
}

copyRecursiveSync(path.join(__dirname, "..", "..", "api", "assets"), path.join(__dirname, "..", "dist", "api", "assets"));
copyRecursiveSync(path.join(__dirname, "..", "..", "api", "client_test"), path.join(__dirname, "..", "dist", "api", "client_test"));
copyRecursiveSync(path.join(__dirname, "..", "..", "api", "locales"), path.join(__dirname, "..", "dist", "api", "locales"));
dirs.forEach((a) => {
	copyRecursiveSync("../" + a + "/src", "dist/" + a + "/src");
	if (verbose) console.log(`Copied ${"../" + a + "/dist"} -> ${"dist/" + a + "/src"}!`);
});

console.log("[1/2] Copying src files done");
if (!argv.includes("copyonly")) {
	console.log("[2/2] Compiling src files ...");

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

