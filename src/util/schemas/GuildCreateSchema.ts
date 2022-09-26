import { ChannelModifySchema } from ".";

export interface GuildCreateSchema {
	/**
	 * @maxLength 100
	 */
	name?: string;
	region?: string;
	icon?: string | null;
	channels?: ChannelModifySchema[];
	guild_template_code?: string;
	system_channel_id?: string;
	rules_channel_id?: string;
}