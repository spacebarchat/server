import path from "path";
import fs from "fs";
import { Plugin, PluginManifest } from "./";

const root = process.env.PLUGIN_LOCATION || "dist/plugins";

let pluginsLoaded = false;
export class PluginLoader {
	public static loadPlugins() {
		console.log(`Plugin root directory: ${path.resolve(root)}`);
		const dirs = fs.readdirSync(root).filter((x) => {
			try {
				fs.readdirSync(path.join(root, x));
				return true;
			} catch (e) {
				return false;
			}
		});
		console.log(dirs);
		dirs.forEach(async (x) => {
			let modPath = path.resolve(path.join(root, x));
			console.log(`Trying to load plugin: ${modPath}`);
			const manifest = require(path.join(modPath, "plugin.json")) as PluginManifest;
			console.log(
				`Plugin info: ${manifest.name} (${manifest.id}), written by ${manifest.authors}, available at ${manifest.repository}`
			);
			const module_ = require(path.join(modPath, manifest.index)) as Plugin;
			try {
				await module_.init();
				module_.emit("loaded");
			} catch (error) {
				module_.emit("error", error);
			}
		});

		//
		//module_.pluginPath =
	}
}
