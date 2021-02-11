export interface User {
	id: bigint;
	username: string;
	discriminator: string;
	avatar: string | null;
	phone?: string;
	desktop: boolean;
	mobile: boolean;
	premium: boolean;
	premium_type: number;
	bot: boolean;
	system: boolean;
	nsfw_allowed: boolean;
	mfa_enabled: boolean;
	created_at: number;
	verified: boolean;
	email: string;
	flags: bigint; // TODO: automatically convert BigInt to BitField of UserFlags
	public_flags: bigint;
	hash: string; // hash of the password, salt is saved in password (bcrypt)
	guilds: bigint[]; // array of guild ids the user is part of
	valid_tokens_since: number; // all tokens with a previous issue date are invalid
	user_settings: UserSettings;
	relationships: Relationship[];
	connected_accounts: ConnectedAccount[];
}

export interface PublicUser {
	id: bigint;
	discriminator: string;
	username: string;
	avatar?: string;
	publicFlags: bigint;
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
	friend_source_flags: { all: boolean };
	gif_auto_play: boolean;
	guild_folders: // every top guild is displayed as a "folder"
	{
		color: number;
		guild_ids: bigint[];
		id: number;
		name: string;
	}[];
	guild_positions: bigint[]; // guild ids ordered by position
	inline_attachment_media: boolean;
	inline_embed_media: boolean;
	locale: string; // en_US
	message_display_compact: boolean;
	native_phone_integration_enabled: boolean;
	render_embeds: boolean;
	render_reactions: boolean;
	restricted_guilds: bigint[];
	show_current_game: boolean;
	status: "online" | "offline" | "dnd" | "idle";
	stream_notifications_enabled: boolean;
	theme: "dark" | "white"; // dark
	timezone_offset: number; // e.g -60
}
