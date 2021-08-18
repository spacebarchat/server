import { UserSettings } from "../../../util/dist";
import { Length } from "../util/instanceOf";

export const UserModifySchema = {
	$username: new Length(String, 2, 32),
	$avatar: String,
	$bio: new Length(String, 0, 190),
	$accent_color: Number,
	$banner: String,
	$password: String,
	$new_password: String,
	$code: String // 2fa code
};

export interface UserModifySchema {
	username?: string;
	avatar?: string | null;
	bio?: string;
	accent_color?: number | null;
	banner?: string | null;
	password?: string;
	new_password?: string;
	code?: string;
}

export const UserSettingsSchema = {
	$afk_timeout: Number,
	$allow_accessibility_detection: Boolean,
	$animate_emoji: Boolean,
	$animate_stickers: Number,
	$contact_sync_enabled: Boolean,
	$convert_emoticons: Boolean,
	$custom_status: {
		$emoji_id: String,
		$emoji_name: String,
		$expires_at: Number,
		$text: String
	},
	$default_guilds_restricted: Boolean,
	$detect_platform_accounts: Boolean,
	$developer_mode: Boolean,
	$disable_games_tab: Boolean,
	$enable_tts_command: Boolean,
	$explicit_content_filter: Number,
	$friend_source_flags: {
		all: Boolean
	},
	$gateway_connected: Boolean,
	$gif_auto_play: Boolean,
	$guild_folders: [
		{
			color: Number,
			guild_ids: [String],
			id: Number,
			name: String
		}
	],
	$guild_positions: [String],
	$inline_attachment_media: Boolean,
	$inline_embed_media: Boolean,
	$locale: String,
	$message_display_compact: Boolean,
	$native_phone_integration_enabled: Boolean,
	$render_embeds: Boolean,
	$render_reactions: Boolean,
	$restricted_guilds: [String],
	$show_current_game: Boolean,
	$status: String,
	$stream_notifications_enabled: Boolean,
	$theme: String,
	$timezone_offset: Number
};

export interface UserSettingsSchema extends UserSettings {}
