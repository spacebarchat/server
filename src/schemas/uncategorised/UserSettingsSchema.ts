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

export interface UserSettingsSchema {
	afk_timeout: number;
	allow_accessibility_detection: boolean;
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
	friend_source_flags: FriendSourceFlags;
	gateway_connected: boolean;
	gif_auto_play: boolean;
	guild_folders: GuildFolder[]; // every top guild is displayed as a "folder"
	guild_positions: string[]; // guild ids ordered by position
	inline_attachment_media: boolean;
	inline_embed_media: boolean;
	locale: string; // en_US
	message_display_compact: boolean;
	native_phone_integration_enabled: boolean;
	render_embeds: boolean;
	render_reactions: boolean;
	restricted_guilds: string[];
	show_current_game: boolean;
	status: "online" | "offline" | "dnd" | "idle" | "invisible";
	stream_notifications_enabled: boolean;
	theme: "dark" | "light"; // dark
	timezone_offset: number; // e.g -60
	view_nsfw_guilds: boolean
}

export interface CustomStatus {
	emoji_id?: string;
	emoji_name?: string;
	expires_at?: number;
	text?: string;
}

export interface GuildFolder {
	color: number;
	guild_ids: string[];
	id: number;
	name: string;
}

export interface FriendSourceFlags {
	all: boolean;
}