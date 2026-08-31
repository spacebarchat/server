/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { AutomodRuleSchema, ChannelPermissionOverwrite, PartialUser, PublicChannel, Snowflake, WebhookResponse } from "@spacebar/schemas";

// Note: some audit log event types have some special keys: https://docs.discord.food/resources/audit-log#audit-log-change-exceptions
export interface AuditLogResponse {
    audit_log_entries: AuditLogEntry[];
    application_commands: unknown[]; // TODO: type
    auto_moderation_rules: AutomodRuleSchema[];
    guild_scheduled_events: unknown[]; // TODO: type
    integrations: unknown[]; // TODO: type
    threads: PublicChannel[];
    users: PartialUser[];
    webhooks: WebhookResponse[];
}

export interface AuditLogEntry {
    id: Snowflake;
    action_type: AuditLogEvents;
    user_id: Snowflake | null;
    target_id: Snowflake | null;
    changes?: AuditLogChange[];
    options?: unknown;
    reason?: string;
}

export enum AuditLogEvents {
    // guild level
    GUILD_UPDATE = 1,
    // channels
    CHANNEL_CREATE = 10,
    CHANNEL_UPDATE = 11,
    CHANNEL_DELETE = 12,
    // permission overrides
    CHANNEL_OVERWRITE_CREATE = 13,
    CHANNEL_OVERWRITE_UPDATE = 14,
    CHANNEL_OVERWRITE_DELETE = 15,
    // kick and ban
    MEMBER_KICK = 20,
    MEMBER_PRUNE = 21,
    MEMBER_BAN_ADD = 22,
    MEMBER_BAN_REMOVE = 23,
    // member updates
    MEMBER_UPDATE = 24,
    MEMBER_ROLE_UPDATE = 25,
    MEMBER_MOVE = 26,
    MEMBER_DISCONNECT = 27,
    BOT_ADD = 28,
    // roles
    ROLE_CREATE = 30,
    ROLE_UPDATE = 31,
    ROLE_DELETE = 32,
    // invites
    INVITE_CREATE = 40,
    INVITE_UPDATE = 41,
    INVITE_DELETE = 42,
    // webhooks
    WEBHOOK_CREATE = 50,
    WEBHOOK_UPDATE = 51,
    WEBHOOK_DELETE = 52,
    // custom emojis
    EMOJI_CREATE = 60,
    EMOJI_UPDATE = 61,
    EMOJI_DELETE = 62,
    // deletion
    MESSAGE_DELETE = 72,
    MESSAGE_BULK_DELETE = 73,
    // pinning
    MESSAGE_PIN = 74,
    MESSAGE_UNPIN = 75,
    // integrations
    INTEGRATION_CREATE = 80,
    INTEGRATION_UPDATE = 81,
    INTEGRATION_DELETE = 82,
    // stage actions
    STAGE_INSTANCE_CREATE = 83,
    STAGE_INSTANCE_UPDATE = 84,
    STAGE_INSTANCE_DELETE = 85,
    // stickers
    STICKER_CREATE = 90,
    STICKER_UPDATE = 91,
    STICKER_DELETE = 92,
    // scheduled events
    GUILD_SCHEDULED_EVENT_CREATE = 100,
    GUILD_SCHEDULED_EVENT_UPDATE = 101,
    GUILD_SCHEDULED_EVENT_DELETE = 102,
    // threads
    THREAD_CREATE = 110,
    THREAD_UPDATE = 111,
    THREAD_DELETE = 112,
    // application commands
    APPLICATION_COMMAND_PERMISSION_UPDATE = 121,
    // soundboard
    SOUNDBOARD_SOUND_CREATE = 130,
    SOUNDBOARD_SOUND_UPDATE = 131,
    SOUNDBOARD_SOUND_DELETE = 132,
    // automod
    AUTO_MODERATION_RULE_CREATE = 140,
    AUTO_MODERATION_RULE_UPDATE = 141,
    AUTO_MODERATION_RULE_DELETE = 142,
    AUTO_MODERATION_BLOCK_MESSAGE = 143,
    AUTO_MODERATION_FLAG_TO_CHANNEL = 144,
    AUTO_MODERATION_USER_COMMUNICATION_DISABLE = 145,
    AUTO_MODERATION_QUARANTINE_USER = 146,
    // creator monetization
    CREATOR_MONETIZATION_REQUEST_CREATED = 150,
    CREATOR_MONETIZATION_TERMS_ACCEPTED = 151,
    // onboarding
    ONBOARDING_PROMPT_CREATE = 163,
    ONBOARDING_PROMPT_UPDATE = 164,
    ONBOARDING_PROMPT_DELETE = 165,
    ONBOARDING_CREATE = 166,
    ONBOARDING_UPDATE = 167,
    // guild home
    GUILD_HOME_FEATURE_ITEM = 171,
    GUILD_HOME_REMOVE_ITEM = 172,
    // ??
    HARMFUL_LINKS_BLOCKED_MESSAGE = 180, // deprecated?
    // new member welcome
    HOME_SETTINGS_CREATE = 190,
    HOME_SETTINGS_UPDATE = 191,
    // voice channel status
    VOICE_CHANNEL_STATUS_CREATE = 192,
    VOICE_CHANNEL_STATUS_DELETE = 193,
    // ??
    CLYDE_AI_PROFILE_UPDATE = 194, // deprecated
    // guild scheduled event exceptions
    GUILD_SCHEDULED_EVENT_EXCEPTION_CREATE = 200,
    GUILD_SCHEDULED_EVENT_EXCEPTION_UPDATE = 201,
    GUILD_SCHEDULED_EVENT_EXCEPTION_DELETE = 202,
    // member verification
    GUILD_MEMBER_VERIFICATION_UPDATE = 210,
    // ??
    GUILD_PROFILE_UPDATE = 211,
    GUILD_MIGRATE_PIN_PERMISSION = 212,
    GUILD_MIGRATE_BYPASS_SLOWMODE_PERMISSION = 213,
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
    owner_id?: string;
    region?: string;
    preferred_locale?: string;
    afk_channel_id?: string;
    afk_timeout?: number;
    rules_channel_id?: string;
    public_updates_channel_id?: string;
    mfa_level?: number;
    verification_level?: number;
    explicit_content_filter?: number;
    default_message_notifications?: number;
    vanity_url_code?: string;
    $add?: object[]; // TODO: These types are bad.
    $remove?: object[];
    prune_delete_days?: number;
    widget_enabled?: boolean;
    widget_channel_id?: string;
    system_channel_id?: string;
    position?: number;
    topic?: string;
    bitrate?: number;
    permission_overwrites?: ChannelPermissionOverwrite[];
    nsfw?: boolean;
    application_id?: string;
    rate_limit_per_user?: number;
    permissions?: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    allow?: string;
    deny?: string;
    code?: string;
    channel_id?: string;
    inviter_id?: string;
    max_uses?: number;
    uses?: number;
    max_age?: number;
    temporary?: boolean;
    deaf?: boolean;
    mute?: boolean;
    nick?: string;
    avatar_hash?: string;
    id?: string;
    type?: number;
    enable_emoticons?: boolean;
    expire_behavior?: number;
    expire_grace_period?: number;
    user_limit?: number;
}
