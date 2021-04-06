/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
import { ChannelPermissionOverwrite } from "./Channel";
import { PublicUser } from "./User";
export interface AuditLogResponse {
    webhooks: [];
    users: PublicUser[];
    audit_log_entries: AuditLogEntries[];
    integrations: [];
}
export interface AuditLogEntries {
    target_id?: string;
    user_id: string;
    id: string;
    action_type: AuditLogEvents;
    options?: {
        delete_member_days?: string;
        members_removed?: string;
        channel_id?: string;
        messaged_id?: string;
        count?: string;
        id?: string;
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
    $add?: {}[];
    $remove?: {}[];
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
export interface AuditLogEntriesDocument extends Document, AuditLogEntries {
    id: string;
}
export declare const AuditLogChanges: {
    name: StringConstructor;
    description: StringConstructor;
    icon_hash: StringConstructor;
    splash_hash: StringConstructor;
    discovery_splash_hash: StringConstructor;
    banner_hash: StringConstructor;
    owner_id: StringConstructor;
    region: StringConstructor;
    preferred_locale: StringConstructor;
    afk_channel_id: StringConstructor;
    afk_timeout: NumberConstructor;
    rules_channel_id: StringConstructor;
    public_updates_channel_id: StringConstructor;
    mfa_level: NumberConstructor;
    verification_level: NumberConstructor;
    explicit_content_filter: NumberConstructor;
    default_message_notifications: NumberConstructor;
    vanity_url_code: StringConstructor;
    $add: {}[];
    $remove: {}[];
    prune_delete_days: NumberConstructor;
    widget_enabled: BooleanConstructor;
    widget_channel_id: StringConstructor;
    system_channel_id: StringConstructor;
    position: NumberConstructor;
    topic: StringConstructor;
    bitrate: NumberConstructor;
    permission_overwrites: {}[];
    nsfw: BooleanConstructor;
    application_id: StringConstructor;
    rate_limit_per_user: NumberConstructor;
    permissions: StringConstructor;
    color: NumberConstructor;
    hoist: BooleanConstructor;
    mentionable: BooleanConstructor;
    allow: StringConstructor;
    deny: StringConstructor;
    code: StringConstructor;
    channel_id: StringConstructor;
    inviter_id: StringConstructor;
    max_uses: NumberConstructor;
    uses: NumberConstructor;
    max_age: NumberConstructor;
    temporary: BooleanConstructor;
    deaf: BooleanConstructor;
    mute: BooleanConstructor;
    nick: StringConstructor;
    avatar_hash: StringConstructor;
    id: StringConstructor;
    type: NumberConstructor;
    enable_emoticons: BooleanConstructor;
    expire_behavior: NumberConstructor;
    expire_grace_period: NumberConstructor;
    user_limit: NumberConstructor;
};
export declare const AuditLogSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const AuditLogModel: import("mongoose").Model<AuditLogEntries>;
export declare enum AuditLogEvents {
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
    INTEGRATION_DELETE = 82
}
