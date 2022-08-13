import { setupListener } from "@fosscord/gateway";
import { Plugin, PluginLoader, PluginManifest } from "@fosscord/util";

export default class TestPlugin implements Plugin {
    pluginManifest?: PluginManifest | undefined;
    async initConfig(): Promise<void> {
        
    }
    onPluginLoaded() {
        console.log("Test plugin active!");
        if(this.pluginManifest) PluginLoader.setPluginConfig(this.pluginManifest.id, this.pluginManifest);
    }
}