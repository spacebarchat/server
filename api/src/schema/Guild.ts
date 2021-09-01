import { Channel } from "@fosscord/util";
import { Length } from "../util/instanceOf";
import { ChannelModifySchema } from "./Channel";

export const GuildCreateSchema = {
	name: new Length(String, 2, 100),
	$region: String, // auto complete voice region of the user
	$icon: String,
	$channels: [ChannelModifySchema],
	$guild_template_code: String,
	$system_channel_id: String,
	$rules_channel_id: String
};

export interface GuildCreateSchema {
	name: string;
	region?: string;
	icon?: string;
	channels?: ChannelModifySchema[];
	guild_template_code?: string;
	system_channel_id?: string;
	rules_channel_id?: string;
}

export const GuildUpdateSchema = {
	...GuildCreateSchema,
	name: undefined,
	$name: new Length(String, 2, 100),
	$banner: String,
	$splash: String,
	$description: String,
	$features: [String],
	$icon: String,
	$verification_level: Number,
	$default_message_notifications: Number,
	$system_channel_flags: String,
	$system_channel_id: String,
	$explicit_content_filter: Number,
	$public_updates_channel_id: String,
	$afk_timeout: Number,
	$afk_channel_id: String,
	$preferred_locale: String
};
// @ts-ignore
delete GuildUpdateSchema.$channels;

export interface GuildUpdateSchema extends Omit<GuildCreateSchema, "channels"> {
	banner?: string;
	splash?: string;
	description?: string;
	features?: string[];
	verification_level?: number;
	default_message_notifications?: number;
	system_channel_flags?: number;
	explicit_content_filter?: number;
	public_updates_channel_id?: string;
	afk_timeout?: number;
	afk_channel_id?: string;
	preferred_locale?: string;
}

export const GuildTemplateCreateSchema = {
	name: String,
	$avatar: String
};

export interface GuildTemplateCreateSchema {
	name: string;
	avatar?: string;
}

export const GuildUpdateWelcomeScreenSchema = {
	$welcome_channels: [
		{
			channel_id: String,
			description: String,
			$emoji_id: String,
			emoji_name: String
		}
	],
	$enabled: Boolean,
	$description: new Length(String, 0, 140)
};

export interface GuildUpdateWelcomeScreenSchema {
	welcome_channels?: {
		channel_id: string;
		description: string;
		emoji_id?: string;
		emoji_name: string;
	}[];
	enabled?: boolean;
	description?: string;
}
