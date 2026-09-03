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
    user_id?: Snowflake;
    target_id?: Snowflake;
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

export interface AuditLogChange<T = AuditLogChangeValue> {
    new_value?: T;
    old_value?: T;
    key: string;
}

export type AuditLogChangeValue =
    | AuditLogGuildChange
    | AuditLogRoleChange
    | AuditLogMemberChange
    | AuditLogChannelChange
    | AuditLogInviteChange
    | AuditLogIntegrationChange;

export interface AuditLogGuildChange {
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
    widget_enabled?: boolean;
    widget_channel_id?: string;
    system_channel_id?: string;
    prune_delete_days?: number;
}

export interface AuditLogRoleChange {
    name?: string;
    description?: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions?: string;
    icon?: string;
    unicode_emoji?: string;
    position?: number;
}

export interface AuditLogMemberChange {
    nick?: string;
    avatar_hash?: string;
    deaf?: boolean;
    mute?: boolean;
    $add?: object[]; // TODO: These types are bad.
    $remove?: object[];
}

export interface AuditLogChannelChange {
    name?: string;
    topic?: string;
    bitrate?: number;
    nsfw?: boolean;
    rate_limit_per_user?: number;
    position?: number;
    parent_id?: string;
    type?: number;
    user_limit?: number;
    permission_overwrites?: ChannelPermissionOverwrite[];
    allow?: string;
    deny?: string;
}

export interface AuditLogInviteChange {
    code?: string;
    channel_id?: string;
    inviter_id?: string;
    max_uses?: number;
    uses?: number;
    max_age?: number;
    temporary?: boolean;
}

export interface AuditLogIntegrationChange {
    application_id?: string;
    id?: string;
    enable_emoticons?: boolean;
    expire_behavior?: number;
    expire_grace_period?: number;
}

export interface GuildUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.GUILD_UPDATE;
    changes?: AuditLogChange<AuditLogGuildChange>[];
}

export interface ChannelCreateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.CHANNEL_CREATE;
    changes?: AuditLogChange<AuditLogChannelChange>[];
}

export interface ChannelUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.CHANNEL_UPDATE;
    changes?: AuditLogChange<AuditLogChannelChange>[];
}

export interface ChannelDeleteEntry extends AuditLogEntry {
    action_type: AuditLogEvents.CHANNEL_DELETE;
    changes?: AuditLogChange<AuditLogChannelChange>[];
}

export interface ChannelOverwriteCreateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.CHANNEL_OVERWRITE_CREATE;
    changes?: AuditLogChange<AuditLogChannelChange>[];
}

export interface ChannelOverwriteUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.CHANNEL_OVERWRITE_UPDATE;
    changes?: AuditLogChange<AuditLogChannelChange>[];
}

export interface ChannelOverwriteDeleteEntry extends AuditLogEntry {
    action_type: AuditLogEvents.CHANNEL_OVERWRITE_DELETE;
    changes?: AuditLogChange<AuditLogChannelChange>[];
}

export interface MemberUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.MEMBER_UPDATE;
    changes?: AuditLogChange<AuditLogMemberChange>[];
}

export interface MemberRoleUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.MEMBER_ROLE_UPDATE;
    changes?: AuditLogChange<AuditLogMemberChange>[];
}

export interface RoleCreateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.ROLE_CREATE;
    changes?: AuditLogChange<AuditLogRoleChange>[];
}

export interface RoleUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.ROLE_UPDATE;
    changes?: AuditLogChange<AuditLogRoleChange>[];
}

export interface RoleDeleteEntry extends AuditLogEntry {
    action_type: AuditLogEvents.ROLE_DELETE;
    changes?: AuditLogChange<AuditLogRoleChange>[];
}

export interface InviteCreateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.INVITE_CREATE;
    changes?: AuditLogChange<AuditLogInviteChange>[];
}

export interface InviteUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.INVITE_UPDATE;
    changes?: AuditLogChange<AuditLogInviteChange>[];
}

export interface InviteDeleteEntry extends AuditLogEntry {
    action_type: AuditLogEvents.INVITE_DELETE;
    changes?: AuditLogChange<AuditLogInviteChange>[];
}

export interface IntegrationUpdateEntry extends AuditLogEntry {
    action_type: AuditLogEvents.INTEGRATION_UPDATE;
    changes?: AuditLogChange<AuditLogIntegrationChange>[];
}

export type AuditLogEntryData =
    | GuildUpdateEntry
    | ChannelCreateEntry
    | ChannelUpdateEntry
    | ChannelDeleteEntry
    | ChannelOverwriteCreateEntry
    | ChannelOverwriteUpdateEntry
    | ChannelOverwriteDeleteEntry
    | MemberUpdateEntry
    | MemberRoleUpdateEntry
    | RoleCreateEntry
    | RoleUpdateEntry
    | RoleDeleteEntry
    | InviteCreateEntry
    | InviteUpdateEntry
    | InviteDeleteEntry
    | IntegrationUpdateEntry;