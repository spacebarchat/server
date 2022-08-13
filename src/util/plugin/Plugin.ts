import EventEmitter from "events";
import { PluginLoadedEventArgs, PluginManifest, TypedEventEmitter } from "@fosscord/util";
import { PluginConfig } from "./PluginConfig";

/*type PluginEvents = {
	error: (error: Error | unknown) => void;
	loaded: () => void;
};*/

//this doesnt work, check later:
 //EventEmitter as new () => TypedEventEmitter<PluginEvents>
export class Plugin {
	/**
	 * Path the plugin resides in.
	 *
	 * @type {string}
	 * @memberof Plugin
	 */
	pluginPath?: string;
	pluginManifest?: PluginManifest;
	/**
	 *
	 *
	 * @memberof Plugin
	 */
	async initConfig() {
		// insert default config into database?
		console.log("did you forget to implement initConfig?");
	}
	/**
	 *	
	 *
	 * @param {PluginLoadedEventArgs} args Info about plugin environment
	 * @memberof Plugin
	 */
	
	async onPluginLoaded?(args?: PluginLoadedEventArgs) {
		
	}

	//frozen functions
	loadConfig?: any = () => {
		return PluginConfig.get();
	}
	saveConfig?: any = () => {

	}
}
