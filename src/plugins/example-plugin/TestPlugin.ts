import { setupListener } from "@fosscord/gateway";
import { Plugin, PluginLoadedEventArgs, PluginLoader, PluginManifest } from "@fosscord/util";
import { TestSettings } from "./TestSettings";

export default class TestPlugin implements Plugin {
    pluginManifest?: PluginManifest | undefined;
    settings: TestSettings = new TestSettings();
    async onPluginLoaded(env: PluginLoadedEventArgs) {
        console.log("Test plugin active!");
        if(this.pluginManifest) this.settings = PluginLoader.getPluginConfig(this.pluginManifest.id, this.settings) as TestSettings;
    }
    
}