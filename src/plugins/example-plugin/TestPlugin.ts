import {
	Channel,
	Guild,
	Plugin,
	PluginLoadedEventArgs,
	PluginLoader,
	PluginManifest,
	PreMessageEventArgs,
	PreMessageEventResult
} from "@fosscord/util";
import { TestSettings } from "./TestSettings";

export default class TestPlugin implements Plugin {
	pluginManifest?: PluginManifest | undefined;
	settings: TestSettings = new TestSettings();
	async onPluginLoaded(env: PluginLoadedEventArgs) {
		console.log("Test plugin active!");
		if (this.pluginManifest) this.settings = PluginLoader.getPluginConfig(this.pluginManifest.id, this.settings) as TestSettings;
	}
	async onPreMessage(data: PreMessageEventArgs): Promise<PreMessageEventResult> {
		let channel = await Channel.findOne({ where: { id: data.message.channel_id } });
		let guild = await Guild.findOne({ where: { id: data.message.guild_id } });
		let block = data.message.content?.includes("UwU");

		let result = { cancel: block } as PreMessageEventResult;

		if (block) {
			console.log(
				`[TestPlugin] Blocked message in ${guild?.name}/#${channel?.name} by ${data.message.author?.username}: ${data.message.content}`
			);
			result.blockReason = "[TestPlugin] Your message contains UwU! Get bamboozled!";
		}

		return result;
	}
}
