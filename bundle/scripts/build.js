const { execSync } = require("child_process");
const path = require("path");
const fse = require("fs-extra");

fse.copySync(path.join(__dirname, "..", "..", "api", "assets"), path.join(__dirname, "..", "dist", "api", "assets"));
fse.copySync(
	path.join(__dirname, "..", "..", "api", "client_test"),
	path.join(__dirname, "..", "dist", "api", "client_test")
);
fse.copySync(path.join(__dirname, "..", "..", "api", "locales"), path.join(__dirname, "..", "dist", "api", "locales"));
fse.copySync(path.join(__dirname, "..", "..", "api", "src"), path.join(__dirname, "..", "dist", "api", "src"));
fse.copySync(path.join(__dirname, "..", "..", "util", "src"), path.join(__dirname, "..", "dist", "util", "src"));
fse.copySync(path.join(__dirname, "..", "..", "cdn", "src"), path.join(__dirname, "..", "dist", "cdn", "src"));
fse.copySync(path.join(__dirname, "..", "..", "gateway", "src"), path.join(__dirname, "..", "dist", "gateway", "src"));
fse.copySync(path.join(__dirname, "..", "..", "bundle", "src"), path.join(__dirname, "..", "dist", "bundle", "src"));

console.log("Copying   src files done");
console.log("Compiling src files ...");

console.log(
	execSync(
		"node " +
			path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsc.js") +
			" -p " +
			path.join(__dirname, ".."),
		{
			cwd: path.join(__dirname, ".."),
			shell: true,
			env: process.env,
			encoding: "utf8",
		}
	)
);
