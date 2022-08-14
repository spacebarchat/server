import path from "path";
import fs from "fs";
import { Plugin, PluginLoadedEventArgs, PluginManifest } from "./";
import { PluginIndex } from "plugins/PluginIndex";
import { PluginConfig } from "./PluginConfig";
import { OrmUtils, PluginConfigEntity } from "..";

const root = process.env.PLUGIN_LOCATION || "dist/plugins";

export class PluginStore {
	public static plugins: Plugin[] = [];
}
