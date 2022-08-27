import { Plugin } from "./";

const root = process.env.PLUGIN_LOCATION || "dist/plugins";

export class PluginStore {
	public static plugins: Plugin[] = [];
}
