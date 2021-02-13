import { Schema, model, Types, Document } from "mongoose";

export interface Guild extends Document {
	id: bigint;
	afk_channel_id?: bigint;
	afk_timeout?: number;
	application_id?: bigint;
	banner?: string;
	default_message_notifications?: number;
	description?: string;
	discovery_splash?: string;
	explicit_content_filter?: number;
	features: string[];
	icon?: string;
	large?: boolean;
	max_members?: number; // e.g. default 100.000
	max_presences?: number;
	max_video_channel_users?: number; // ? default: 25, is this max 25 streaming or watching
	member_count?: number;
	presence_count?: number; // users online
	// members?: Member[]; // * Members are stored in a seperate collection
	// roles: Role[]; // * Role are stored in a seperate collection
	// channels: GuildChannel[]; // * Channels are stored in a seperate collection
	// emojis: Emoji[];  // * Emojis are stored in a seperate collection
	mfa_level?: number;
	name: string;
	owner_id: bigint;
	preferred_locale?: string; // only community guilds can choose this
	premium_subscription_count?: number;
	premium_tier?: number; // nitro boost level
	public_updates_channel_id?: bigint;
	region?: string;
	rules_channel_id?: bigint;
	splash?: string;
	system_channel_flags?: number;
	system_channel_id?: bigint;
	unavailable?: boolean;
	vanity_url_code?: string;
	verification_level?: number;
	voice_states: []; // connected users
	welcome_screen: []; // welcome splash screen if a user joins guild
	widget_channel_id?: bigint;
	widget_enabled?: boolean;
}

export const GuildSchema = new Schema({
	afk_channel_id: Types.Long,
	afk_timeout: Number,
	application_id: Types.Long,
	banner: String,
	default_message_notifications: Number,
	description: String,
	discovery_splash: String,
	explicit_content_filter: Number,
	features: { type: [String], default: [] },
	icon: String,
	id: { type: Types.Long, required: true },
	large: Boolean,
	max_members: { type: Number, default: 100000 },
	max_presences: Number,
	max_video_channel_users: { type: Number, default: 25 },
	member_count: Number,
	presence_count: Number,
	mfa_level: Number,
	name: { type: String, required: true },
	owner_id: { type: Types.Long, required: true },
	preferred_locale: String,
	premium_subscription_count: Number,
	premium_tier: Number,
	public_updates_channel_id: Types.Long,
	region: String,
	rules_channel_id: Types.Long,
	splash: String,
	system_channel_flags: Number,
	system_channel_id: Types.Long,
	unavailable: Boolean,
	vanity_url_code: String,
	verification_level: Number,
	voice_states: { type: [Object], default: [] },
	welcome_screen: { type: [Object], default: [] },
	widget_channel_id: Types.Long,
	widget_enabled: Boolean,
});

export const GuildModel = model<Guild>("Guild", GuildSchema, "guilds");
