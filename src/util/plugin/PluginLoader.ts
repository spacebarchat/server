import path from "path";
import fs from "fs";
import { Plugin, PluginLoadedEventArgs, PluginManifest } from "./";
import { PluginIndex } from "plugins/PluginIndex";

const root = process.env.PLUGIN_LOCATION || "dist/plugins";

let pluginsLoaded = false;
export class PluginLoader {
	public static plugins: Plugin[] = [];
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
		PluginIndex.forEach((x: any)=>{
			console.log(x.onPluginLoaded)
		})
		dirs.forEach(async (x) => {
			let modPath = path.resolve(path.join(root, x));
			console.log(`Trying to load plugin: ${modPath}`);
			const manifest = require(path.join(modPath, "plugin.json")) as PluginManifest;
			console.log(
				`Plugin info: ${manifest.name} (${manifest.id}), written by ${manifest.authors}, available at ${manifest.repository}`
			);
			const module_ = PluginIndex["example-plugin"];
			
			module_.pluginPath = modPath;
			if(module_.onPluginLoaded) module_.onPluginLoaded({} as PluginLoadedEventArgs); 
			this.plugins.push(module_);
		});

		console.log(`Done loading ${this.plugins.length} plugins!`)
	}
}
