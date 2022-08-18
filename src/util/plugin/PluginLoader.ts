import fs from "fs";
import path from "path";
import { OrmUtils } from "..";
import { PluginIndex } from "../../plugins/PluginIndex";
import { PluginLoadedEventArgs, PluginManifest, PluginStore } from "./";
import { PluginConfig } from "./PluginConfig";

const root = process.env.PLUGIN_LOCATION || "dist/plugins";

let pluginsLoaded = false;
export class PluginLoader {
	public static async loadPlugins() {
		if (pluginsLoaded) return;
		PluginConfig.init();
		console.log(`Plugin root directory: ${path.resolve(root)}`);
		const dirs = fs.readdirSync(root).filter((x) => {
			try {
				fs.readdirSync(path.join(root, x));
				return true;
			} catch (e) {
				return false;
			}
		});
		//console.log(dirs);
		PluginIndex.forEach((x: any) => {
			//console.log(x.onPluginLoaded)
		});
		dirs.forEach(async (x) => {
			let modPath = path.resolve(path.join(root, x));
			//console.log(`Trying to load plugin: ${modPath}`);
			const manifest = require(path.join(modPath, "plugin.json")) as PluginManifest;
			console.log(
				`Plugin info: ${manifest.name} (${manifest.id}), written by ${manifest.authors}, available at ${manifest.repository}`
			);
			const module_ = PluginIndex[manifest.id];

			module_.pluginPath = modPath;
			module_.pluginManifest = manifest;
			Object.freeze(module_.pluginPath);
			Object.freeze(module_.pluginManifest);

			if (module_.onPluginLoaded) await module_.onPluginLoaded({} as PluginLoadedEventArgs);
			PluginStore.plugins.push(module_);
		});

		console.log(`Done loading ${PluginStore.plugins.length} plugins!`);
	}

	public static getPluginConfig(id: string, defaults?: any): any {
		let cfg = PluginConfig.get()[id];
		if (defaults) {
			if (cfg) cfg = OrmUtils.mergeDeep(defaults, cfg);
			else cfg = defaults;
			this.setPluginConfig(id, cfg);
		}
		if (!cfg) console.log(`[PluginConfig/WARN] Getting plugin settings for '${id}' returned null! (Did you forget to add settings?)`);
		return cfg;
	}
	public static async setPluginConfig(id: string, config: Partial<any>): Promise<void> {
		if (!config) console.log(`[PluginConfig/WARN] ${id} tried to set config=null!`);
		await PluginConfig.set({ [id]: OrmUtils.mergeDeep(PluginLoader.getPluginConfig(id) || {}, config) });
	}
}
