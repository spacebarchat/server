import { UserGuildSettings, ChannelOverride } from "@fosscord/util";

// This sucks. I would use a DeepPartial, my own or typeorms, but they both generate inncorect schema
export interface UserGuildSettingsSchema
	extends Partial<Omit<UserGuildSettings, "channel_overrides">> {
	channel_overrides: {
		[channel_id: string]: Partial<ChannelOverride>;
	};
}