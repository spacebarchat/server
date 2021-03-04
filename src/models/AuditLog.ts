import { Schema, Document, Types } from "mongoose";
import db from "../util/Database";
import { ChannelPermissionOverwrite } from "./Channel";
import { PublicUser } from "./User";

export interface AuditLogResponse {
	webhooks: []; // TODO:
	users: PublicUser[];
	audit_log_entries: AuditLogEntries[];
	integrations: [];
}

export interface AuditLogEntries {
	target_id?: bigint;
	user_id: bigint;
	id: bigint;
	action_type: AuditLogEvents;
	options?: {
		delete_member_days?: string;
		members_removed?: string;
		channel_id?: bigint;
		messaged_id?: bigint;
		count?: string;
		id?: bigint;
		type?: string;
		role_name?: string;
	};
	changes: AuditLogChange[];
	reason?: string;
}

export interface AuditLogChange {
	new_value?: AuditLogChangeValue;
	old_value?: AuditLogChangeValue;
	key: string;
}

export interface AuditLogChangeValue {
	name?: string;
	description?: string;
	icon_hash?: string;
	splash_hash?: string;
	discovery_splash_hash?: string;
	banner_hash?: string;
	owner_id?: bigint;
	region?: string;
	preferred_locale?: string;
	afk_channel_id?: bigint;
	afk_timeout?: number;
	rules_channel_id?: bigint;
	public_updates_channel_id?: bigint;
	mfa_level?: number;
	verification_level?: number;
	explicit_content_filter?: number;
	default_message_notifications?: number;
	vanity_url_code?: string;
	$add?: {}[];
	$remove?: {}[];
	prune_delete_days?: number;
	widget_enabled?: boolean;
	widget_channel_id?: bigint;
	system_channel_id?: bigint;
	position?: number;
	topic?: string;
	bitrate?: number;
	permission_overwrites?: ChannelPermissionOverwrite[];
	nsfw?: boolean;
	application_id?: bigint;
	rate_limit_per_user?: number;
	permissions?: string;
	color?: number;
	hoist?: boolean;
	mentionable?: boolean;
	allow?: string;
	deny?: string;
	code?: string;
	channel_id?: bigint;
	inviter_id?: bigint;
	max_uses?: number;
	uses?: number;
	max_age?: number;
	temporary?: boolean;
	deaf?: boolean;
	mute?: boolean;
	nick?: string;
	avatar_hash?: string;
	id?: bigint;
	type?: number;
	enable_emoticons?: boolean;
	expire_behavior?: number;
	expire_grace_period?: number;
	user_limit?: number;
}

export interface AuditLogEntriesDocument extends Document, AuditLogEntries {
	id: bigint;
}

export const AuditLogChanges = {
	name: String,
	description: String,
	icon_hash: String,
	splash_hash: String,
	discovery_splash_hash: String,
	banner_hash: String,
	owner_id: Types.Long,
	region: String,
	preferred_locale: String,
	afk_channel_id: Types.Long,
	afk_timeout: Number,
	rules_channel_id: Types.Long,
	public_updates_channel_id: Types.Long,
	mfa_level: Number,
	verification_level: Number,
	explicit_content_filter: Number,
	default_message_notifications: Number,
	vanity_url_code: String,
	$add: [{}],
	$remove: [{}],
	prune_delete_days: Number,
	widget_enabled: Boolean,
	widget_channel_id: Types.Long,
	system_channel_id: Types.Long,
	position: Number,
	topic: String,
	bitrate: Number,
	permission_overwrites: [{}],
	nsfw: Boolean,
	application_id: Types.Long,
	rate_limit_per_user: Number,
	permissions: String,
	color: Number,
	hoist: Boolean,
	mentionable: Boolean,
	allow: String,
	deny: String,
	code: String,
	channel_id: Types.Long,
	inviter_id: Types.Long,
	max_uses: Number,
	uses: Number,
	max_age: Number,
	temporary: Boolean,
	deaf: Boolean,
	mute: Boolean,
	nick: String,
	avatar_hash: String,
	id: Types.Long,
	type: Number,
	enable_emoticons: Boolean,
	expire_behavior: Number,
	expire_grace_period: Number,
	user_limit: Number,
};

export const AuditLogSchema = new Schema({
	target_id: Types.Long,
	user_id: { type: Types.Long, required: true },
	id: { type: Types.Long, required: true },
	action_type: { type: Number, required: true },
	options: {
		delete_member_days: String,
		members_removed: String,
		channel_id: Types.Long,
		messaged_id: Types.Long,
		count: String,
		id: Types.Long,
		type: String,
		role_name: String,
	},
	changes: [
		{
			new_value: AuditLogChanges,
			old_value: AuditLogChanges,
			key: String,
		},
	],
	reason: String,
});

// @ts-ignore
export const AuditLogModel = db.model<AuditLogEntries>("AuditLog", AuditLogSchema, "auditlogs");

export enum AuditLogEvents {
	GUILD_UPDATE = 1,
	CHANNEL_CREATE = 10,
	CHANNEL_UPDATE = 11,
	CHANNEL_DELETE = 12,
	CHANNEL_OVERWRITE_CREATE = 13,
	CHANNEL_OVERWRITE_UPDATE = 14,
	CHANNEL_OVERWRITE_DELETE = 15,
	MEMBER_KICK = 20,
	MEMBER_PRUNE = 21,
	MEMBER_BAN_ADD = 22,
	MEMBER_BAN_REMOVE = 23,
	MEMBER_UPDATE = 24,
	MEMBER_ROLE_UPDATE = 25,
	MEMBER_MOVE = 26,
	MEMBER_DISCONNECT = 27,
	BOT_ADD = 28,
	ROLE_CREATE = 30,
	ROLE_UPDATE = 31,
	ROLE_DELETE = 32,
	INVITE_CREATE = 40,
	INVITE_UPDATE = 41,
	INVITE_DELETE = 42,
	WEBHOOK_CREATE = 50,
	WEBHOOK_UPDATE = 51,
	WEBHOOK_DELETE = 52,
	EMOJI_CREATE = 60,
	EMOJI_UPDATE = 61,
	EMOJI_DELETE = 62,
	MESSAGE_DELETE = 72,
	MESSAGE_BULK_DELETE = 73,
	MESSAGE_PIN = 74,
	MESSAGE_UNPIN = 75,
	INTEGRATION_CREATE = 80,
	INTEGRATION_UPDATE = 81,
	INTEGRATION_DELETE = 82,
}
