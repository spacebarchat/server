import path from "path";
import fs from "fs";
import { Plugin, PluginLoadedEventArgs, PluginManifest } from "./";
import { PluginIndex } from "plugins/PluginIndex";
import { PluginConfig } from "./PluginConfig";
import { OrmUtils, PluginConfigEntity } from "..";

const root = process.env.PLUGIN_LOCATION || "dist/plugins";

let pluginsLoaded = false;
export class PluginLoader {
	public static plugins: Plugin[] = [];
	public static async loadPlugins() {
		if(pluginsLoaded) return;
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
			console.log(`Trying to load plugin: ${modPath}`);
			const manifest = require(path.join(modPath, "plugin.json")) as PluginManifest;
			console.log(
				`Plugin info: ${manifest.name} (${manifest.id}), written by ${manifest.authors}, available at ${manifest.repository}`
			);
			const module_ = PluginIndex["example-plugin"];
			
			module_.pluginPath = modPath;
			module_.pluginManifest = manifest;
			Object.freeze(module_.pluginPath);
			Object.freeze(module_.pluginManifest);
			
			if(module_.onPluginLoaded) await module_.onPluginLoaded({} as PluginLoadedEventArgs);
			this.plugins.push(module_);
		});

		console.log(`Done loading ${this.plugins.length} plugins!`)
		await PluginConfigEntity.save(PluginConfig.get());
	}
	public static getPluginConfig(id: string, defaults?: any): any {
		let cfg = PluginConfig.get()[id];
		if(defaults) {
			cfg = OrmUtils.mergeDeep(defaults, cfg);
			this.setPluginConfig(id, cfg);
		}

		return cfg;
	}
	public static async setPluginConfig(id: string, config: Partial<any>): Promise<any> {
		await PluginConfig.set({ [id]: config.merge(PluginLoader.getPluginConfig(id) as any) } as any)
	}
}
