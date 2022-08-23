const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

module.exports = function (config) {
	console.log(`==> Building plugin index...`);
	let output = 'import { Plugin } from "util/plugin";\n';

	const dirs = fs.readdirSync(config.pluginDir).filter((x) => {
		try {
			fs.readdirSync(path.join(config.pluginDir, x));
			return true;
		} catch (e) {
			return false;
		}
	});
	dirs.forEach((x) => {
		let pluginManifest = require(path.join(config.pluginDir, x, "plugin.json"));
		console.log(`  ==> Registering plugin: ${pluginManifest.name} (${pluginManifest.id}) by ${pluginManifest.authors}`);
		output += `import * as ${sanitizeVarName(x)} from "./${x}/${pluginManifest.mainClass}";\n`;
	});
	output += `\nexport const PluginIndex: any = {\n`;
	dirs.forEach((x) => {
		output += `    "${x}": new ${sanitizeVarName(x)}.default(),\n`; //ctor test: '${path.resolve(path.join(pluginDir, x))}', require('./${x}/plugin.json')
	});
	output += `};`;

	fs.writeFileSync(path.join(config.pluginDir, "PluginIndex.ts"), output);
};
