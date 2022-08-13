import { Plugin } from "@fosscord/util";

export default class TestPlugin implements Plugin {
    pluginPath: string;
    async initConfig(): Promise<void> {
        
    }
    onPluginLoaded() {
        console.log("Test plugin active!");
    }
    
}