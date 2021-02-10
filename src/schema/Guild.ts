import { Length } from "../util/instanceOf";

export const GuildCreateSchema = {
	name: new Length(String, 2, 100), // ! 2-100 chars
	$region: String, // auto complete voice region of the user
};

export interface GuildCreateSchema {
	name: string;
	region?: string;
}

export const GuildUpdateSchema = {
	...GuildCreateSchema,
	$banner: String,
	$splash: String,
	$description: String,
	$features: [String],
	$icon: String,
	$verification_level: Number,
	$default_message_notifications: Number,
	$system_channel_flags: Number,
	$system_channel_id: BigInt,
	$explicit_content_filter: Number,
	$public_updates_channel_id: BigInt,
	$afk_timeout: Number,
	$afk_channel_id: BigInt,
};

export interface GuildUpdateSchema extends GuildCreateSchema {
	banner?: string;
	splash?: string;
	description?: string;
	features?: [string];
	icon?: string;
	verification_level?: number;
	default_message_notifications?: number;
	system_channel_flags?: number;
	system_channel_id?: bigint;
	explicit_content_filter?: number;
	public_updates_channel_id?: bigint;
	afk_timeout?: number;
	afk_channel_id?: bigint;
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
	approximate_presence_count: true,
	// welcome_screen: true,
};
