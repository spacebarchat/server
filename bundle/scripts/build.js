const { execSync } = require("child_process");
const path = require("path");
const fse = require("fs-extra");

const api = path.join(__dirname, "..", "..", "api");
const dist = path.join(__dirname, "..", "dist");

fse.copySync(path.join(api, "assets"), path.join(dist, "api", "assets"));
fse.copySync(path.join(api, "client_test"), path.join(dist, "api", "client_test"));
fse.copySync(path.join(api, "locales"), path.join(dist, "api", "locales"));

console.log(
	execSync("node " + path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsc.js") + " -p .", {
		cwd: path.join(__dirname, ".."),
		shell: true,
		env: process.env,
		encoding: "utf8",
	})
);
