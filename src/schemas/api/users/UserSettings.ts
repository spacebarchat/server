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

import { z } from "zod";

const CustomStatusSchema = z
    .object({
        emoji_id: z.string().optional(),
        emoji_name: z.string().optional(),
        expires_at: z.number().optional(),
        text: z.string().optional(),
    })
    .nullable();

const FriendSourceFlagsSchema = z.object({
    all: z.boolean(),
});

const GuildFolderSchema = z.object({
    color: z.number().nullish(),
    guild_ids: z.array(z.string()),
    id: z.number().nullish(),
    name: z.string().nullish(),
});

export const UserSettingsSchema = z.object({
    afk_timeout: z.number(),
    allow_accessibility_detection: z.boolean(),
    animate_emoji: z.boolean(),
    animate_stickers: z.number(),
    contact_sync_enabled: z.boolean(),
    convert_emoticons: z.boolean(),
    custom_status: CustomStatusSchema,
    default_guilds_restricted: z.boolean(),
    detect_platform_accounts: z.boolean(),
    developer_mode: z.boolean(),
    disable_games_tab: z.boolean(),
    enable_tts_command: z.boolean(),
    explicit_content_filter: z.number(),
    friend_discovery_flags: z.number(),
    friend_source_flags: FriendSourceFlagsSchema,
    gateway_connected: z.boolean(),
    gif_auto_play: z.boolean(),
    guild_folders: z.array(GuildFolderSchema),
    guild_positions: z.array(z.string()),
    inline_attachment_media: z.boolean(),
    inline_embed_media: z.boolean(),
    locale: z.string(),
    message_display_compact: z.boolean(),
    native_phone_integration_enabled: z.boolean(),
    render_embeds: z.boolean(),
    render_reactions: z.boolean(),
    restricted_guilds: z.array(z.string()),
    show_current_game: z.boolean(),
    status: z.enum(["online", "offline", "dnd", "idle", "invisible"]),
    stream_notifications_enabled: z.boolean(),
    theme: z.enum(["dark", "light"]),
    timezone_offset: z.number(),
    view_nsfw_guilds: z.boolean(),
});

export const UserSettingsUpdateSchema = UserSettingsSchema.partial();

export type UserSettingsSchema = z.infer<typeof UserSettingsSchema>;
export type UserSettingsUpdateSchema = z.infer<typeof UserSettingsUpdateSchema>;

// Re-export sub-types for downstream consumers
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
    all: boolean;
}
