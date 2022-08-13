import { Plugin } from "@fosscord/util";

export default class TestPlugin extends Plugin {
    onPluginLoaded(): void {
        console.log("Hello from test plugin! IT WORKS!!!!!!!");
    }
}