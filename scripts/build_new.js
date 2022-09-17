const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("./utils");
const os = require('os');

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

let config;
if (fs.existsSync(path.join(rootDir, `build.${os.hostname()}.json`))) {
	console.log(`Using build.${os.hostname()}.json`);
	config = { rootDir, srcDir, distDir, configPath, buildLog, buildLogAnsi, pluginDir, ...require(path.join(rootDir, `build.${os.hostname()}.json`)) };
}
else if (fs.existsSync(configPath)) {
	console.log(`Using build.json`);
	config = { rootDir, srcDir, distDir, configPath, buildLog, buildLogAnsi, pluginDir, ...require(configPath) };
}
else if (!fs.existsSync(configPath)) {
	console.log(`Using default config`);
	if (!fs.existsSync(path.join(configPath + ".default"))) {
		console.log("build.json.default not found! Exiting!");
		exit(1);
	}
	fs.copyFileSync(configPath + ".default", configPath);
	config = { rootDir, srcDir, distDir, configPath, buildLog, buildLogAnsi, pluginDir, ...require(configPath) };
}


config.steps.pre.forEach((step) => require(path.join(buildStepDir, step))(config));
require(path.join(buildStepDir, "compile_" + config.compiler))(config);
config.steps.post.forEach((step) => require(path.join(buildStepDir, step))(config));
