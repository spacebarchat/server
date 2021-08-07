import { ChannelSchema, GuildChannel } from "@fosscord/server-util";
import { Length } from "../util/instanceOf";

export const GuildCreateSchema = {
	name: new Length(String, 2, 100),
	$region: String, // auto complete voice region of the user
	$icon: String,
	$channels: [Object],
	$guild_template_code: String,
	$system_channel_id: String,
	$rules_channel_id: String
};

export interface GuildCreateSchema {
	name: string;
	region?: string;
	icon?: string;
	channels?: GuildChannel[];
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
	$system_channel_flags: Number,
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
	features?: [string];
	verification_level?: number;
	default_message_notifications?: number;
	system_channel_flags?: number;
	explicit_content_filter?: number;
	public_updates_channel_id?: string;
	afk_timeout?: number;
	afk_channel_id?: string;
	preferred_locale?: string;
}

export const GuildGetSchema = {
	id: true,
	name: true,
	icon: true,
	splash: true,
	discovery_splash: true,
	owner: true,
	owner_id: true,
	permissions: true,
	region: true,
	afk_channel_id: true,
	afk_timeout: true,
	widget_enabled: true,
	widget_channel_id: true,
	verification_level: true,
	default_message_notifications: true,
	explicit_content_filter: true,
	roles: true,
	emojis: true,
	features: true,
	mfa_level: true,
	application_id: true,
	system_channel_id: true,
	system_channel_flags: true,
	rules_channel_id: true,
	joined_at: true,
	// large: true,
	// unavailable: true,
	member_count: true,
	// voice_states: true,
	// members: true,
	// channels: true,
	// presences: true,
	max_presences: true,
	max_members: true,
	vanity_url_code: true,
	description: true,
	banner: true,
	premium_tier: true,
	premium_subscription_count: true,
	preferred_locale: true,
	public_updates_channel_id: true,
	max_video_channel_users: true,
	approximate_member_count: true,
	approximate_presence_count: true
	// welcome_screen: true,
};

export const GuildTemplateCreateSchema = {
	name: String,
	$avatar: String
};

export interface GuildTemplateCreateSchema {
	name: string;
	avatar?: string;
}

export const GuildAddChannelToWelcomeScreenSchema = {
	channel_id: String,
	description: String,
	$emoji_id: String,
	emoji_name: String
};

export interface GuildAddChannelToWelcomeScreenSchema {
	channel_id: string;
	description: string;
	emoji_id?: string;
	emoji_name: string;
}
