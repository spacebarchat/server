/// <reference path="../util/MongoBigInt.d.ts" />
import { Activity } from "./Activity";
import { ClientStatus, Status } from "./Status";
import { Schema, Document } from "mongoose";
export interface User {
    id: bigint;
    username: string;
    discriminator: string;
    avatar: string | null;
    fingerprints: string[];
    phone?: string;
    desktop: boolean;
    mobile: boolean;
    premium: boolean;
    premium_type: number;
    bot: boolean;
    system: boolean;
    level: string;
    nsfw_allowed: boolean;
    mfa_enabled: boolean;
    created_at: number;
    verified: boolean;
    email?: string;
    flags: bigint;
    public_flags: bigint;
    hash: string;
    guilds: bigint[];
    valid_tokens_since: number;
    user_settings: UserSettings;
    relationships: Relationship[];
    connected_accounts: ConnectedAccount[];
    presence: {
        status: Status;
        activities: Activity[];
        client_status: ClientStatus;
    };
}
export interface UserDocument extends User, Document {
    id: bigint;
}
export interface PublicUser {
    id: bigint;
    discriminator: string;
    username: string;
    avatar?: string;
    public_flags: bigint;
}
export interface ConnectedAccount {
    access_token: string;
    friend_sync: boolean;
    id: string;
    name: string;
    revoked: boolean;
    show_activity: boolean;
    type: string;
    verifie: boolean;
    visibility: number;
}
export interface Relationship {
    id: bigint;
    nickname?: string;
    type: number;
    user_id: bigint;
}
export interface UserSettings {
    afk_timeout: number;
    allow_accessibility_detection: boolean;
    animate_emoji: boolean;
    animate_stickers: number;
    contact_sync_enabled: boolean;
    convert_emoticons: boolean;
    custom_status: {
        emoji_id: bigint | null;
        emoji_name: string | null;
        expires_at: number | null;
        text: string | null;
    };
    default_guilds_restricted: boolean;
    detect_platform_accounts: boolean;
    developer_mode: boolean;
    disable_games_tab: boolean;
    enable_tts_command: boolean;
    explicit_content_filter: number;
    friend_source_flags: {
        all: boolean;
    };
    gateway_connected: boolean;
    gif_auto_play: boolean;
    guild_folders: {
        color: number;
        guild_ids: bigint[];
        id: number;
        name: string;
    }[];
    guild_positions: bigint[];
    inline_attachment_media: boolean;
    inline_embed_media: boolean;
    locale: string;
    message_display_compact: boolean;
    native_phone_integration_enabled: boolean;
    render_embeds: boolean;
    render_reactions: boolean;
    restricted_guilds: bigint[];
    show_current_game: boolean;
    status: "online" | "offline" | "dnd" | "idle";
    stream_notifications_enabled: boolean;
    theme: "dark" | "white";
    timezone_offset: number;
}
export declare const UserSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const UserModel: import("mongoose").Model<UserDocument>;
