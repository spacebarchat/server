/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { Snowflake } from "@spacebar/schemas";

export type UserSettingsUpdateSchema = Partial<UserSettingsSchema>;

export interface UserSettingsSchema {
    activity_restricted_guild_ids: Snowflake[];
    activity_joining_restricted_guild_ids: Snowflake[];
    afk_timeout: number;
    allow_accessibility_detection: boolean;
    allow_activity_party_privacy_friends: boolean;
    allow_activity_party_privacy_voice_channel: boolean;
    animate_emoji: boolean;
    animate_stickers: number;
    contact_sync_enabled: boolean;
    convert_emoticons: boolean;
    custom_status: CustomStatus | null;
    default_guilds_restricted: boolean;
    detect_platform_accounts: boolean;
    developer_mode: boolean;
    disable_games_tab: boolean;
    enable_tts_command: boolean;
    explicit_content_filter: number;
    friend_discovery_flags: number;
    friend_source_flags: FriendSourceFlags | null;
    gif_auto_play: boolean;
    guild_folders: GuildFolder[]; // every top guild is displayed as a "folder"
    inline_attachment_media: boolean;
    inline_embed_media: boolean;
    locale: string; // en_US
    message_display_compact: boolean;
    native_phone_integration_enabled: boolean;
    passwordless: boolean;
    render_embeds: boolean;
    render_reactions: boolean;
    restricted_guilds: string[];
    show_current_game: boolean;
    slayer_sdk_receive_dms_in_game: number;
    soundboard_volume: number;
    status: "online" | "offline" | "dnd" | "idle" | "invisible";
    stream_notifications_enabled: boolean;
    theme: "dark" | "light" | "darker" | "midnight"; // dark
    timezone_offset: number; // e.g -60
    view_nsfw_commands: boolean;
    view_nsfw_guilds: boolean;
}

export interface CustomStatus {
    emoji_id?: string;
    emoji_name?: string;
    expires_at?: number;
    text?: string;
}

export interface GuildFolder {
    color?: number | null;
    guild_ids: string[];
    id?: number | null;
    name?: string | null;
}

export interface FriendSourceFlags {
    all?: boolean;
    mutual_friends?: boolean;
    mutual_guilds?: boolean;
}
