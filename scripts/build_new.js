const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("./utils");

//file paths
const rootDir = path.join(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const scriptsDir = path.join(rootDir, "scripts");
const configPath = path.join(rootDir, "build.json");
const buildLog = path.join(rootDir, "build.log");
const buildLogAnsi = path.join(rootDir, "build.log.ansi");
const pluginDir = path.join(srcDir, "plugins");

//more, dont export
const buildStepDir = path.join(scriptsDir, "build");

if (!fs.existsSync(configPath)) {
	if (!fs.existsSync(path.join(configPath + ".default"))) {
		console.log("build.json.default not found! Exiting!");
		exit(1);
	}
	fs.copyFileSync(configPath + ".default", configPath);
}
let config = { rootDir, srcDir, distDir, configPath, buildLog, buildLogAnsi, pluginDir, ...require(configPath) };

config.steps.pre.forEach((step) => require(path.join(buildStepDir, step))(config));
require(path.join(buildStepDir, "compile_" + config.compiler))(config);
config.steps.post.forEach((step) => require(path.join(buildStepDir, step))(config));
