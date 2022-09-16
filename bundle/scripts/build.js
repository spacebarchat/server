const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { getSystemErrorMap } = require("util");
const { argv } = require("process");

var steps = 2, i = 0;
if (argv.includes("clean")) steps++;
if (argv.includes("copyonly")) steps--;
const dirs = ["api", "util", "cdn", "gateway", "bundle", "webrtc"];

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
	console.log(`[${++i}/${steps}] Cleaning...`);
	dirs.forEach((a) => {
		var d = "../" + a + "/dist";
		if (fs.existsSync(d)) {
			fs.rmSync(d, { recursive: true });
			if (verbose) console.log(`Deleted ${d}!`);
		}
	});
}

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

