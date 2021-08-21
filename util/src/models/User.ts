import { Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./Activity";
import { BaseClass } from "./BaseClass";
import { ClientStatus, Status } from "./Status";

export const PublicUserProjection = {
	username: true,
	discriminator: true,
	id: true,
	public_flags: true,
	avatar: true,
	accent_color: true,
	banner: true,
	bio: true,
	bot: true,
};

export class User extends BaseClass {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	username: string; // username max length 32, min 2 (should be configurable)

	@Column()
	discriminator: string; // #0001 4 digit long string from #0001 - #9999

	@Column()
	avatar: string | null; // hash of the user avatar

	@Column()
	accent_color: number | null; // banner color of user

	@Column()
	banner: string | null; // hash of the user banner

	@Column()
	phone: string | null; // phone number of the user

	@Column()
	desktop: boolean; // if the user has desktop app installed

	@Column()
	mobile: boolean; // if the user has mobile app installed

	@Column()
	premium: boolean; // if user bought nitro

	@Column()
	premium_type: number; // nitro level

	@Column()
	bot: boolean; // if user is bot

	@Column()
	bio: string; // short description of the user (max 190 chars -> should be configurable)

	@Column()
	system: boolean; // shouldn't be used, the api sents this field type true, if the generated message comes from a system generated author

	@Column()
	nsfw_allowed: boolean; // if the user is older than 18 (resp. Config)

	@Column()
	mfa_enabled: boolean; // if multi factor authentication is enabled

	@Column()
	created_at: Date; // registration date

	@Column()
	verified: boolean; // if the user is offically verified

	@Column()
	disabled: boolean; // if the account is disabled

	@Column()
	deleted: boolean; // if the user was deleted

	@Column()
	email: string | null; // email of the user

	@Column()
	flags: bigint; // UserFlags

	@Column()
	public_flags: bigint;

	@Column("simple-array") // string in simple-array must not contain commas
	guilds: string[]; // array of guild ids the user is part of

	@Column("simple-json")
	user_settings: UserSettings;

	@Column("simple-json")
	user_data: UserData;

	@Column("simple-json")
	presence: {
		status: Status;
		activities: Activity[];
		client_status: ClientStatus;
	};

	@Column("simple-json")
	relationships: Relationship[];

	@Column("simple-json")
	connected_accounts: ConnectedAccount[];
}

// @ts-ignore
global.User = User;

// Private user data that should never get sent to the client
export interface UserData {
	valid_tokens_since: Date; // all tokens with a previous issue date are invalid
	hash: string; // hash of the password, salt is saved in password (bcrypt)
	fingerprints: string[]; // array of fingerprints -> used to prevent multiple accounts
}

export interface PublicUser {
	id: string;
	discriminator: string;
	username: string;
	avatar: string | null;
	accent_color: number;
	banner: string | null;
	public_flags: bigint;
	bot: boolean;
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
	id: string;
	nickname?: string;
	type: RelationshipType;
}

export enum RelationshipType {
	outgoing = 4,
	incoming = 3,
	blocked = 2,
	friends = 1,
}

export interface UserSettings {
	afk_timeout: number;
	allow_accessibility_detection: boolean;
	animate_emoji: boolean;
	animate_stickers: number;
	contact_sync_enabled: boolean;
	convert_emoticons: boolean;
	custom_status: {
		emoji_id: string | null;
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
	gateway_connected: boolean;
	gif_auto_play: boolean;
	guild_folders: // every top guild is displayed as a "folder"
	{
		color: number;
		guild_ids: string[];
		id: number;
		name: string;
	}[];
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
	status: "online" | "offline" | "dnd" | "idle";
	stream_notifications_enabled: boolean;
	theme: "dark" | "white"; // dark
	timezone_offset: number; // e.g -60
}
