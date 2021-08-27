import { Column, Entity, JoinColumn, OneToMany, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { BitField } from "../util/BitField";
import { Relationship } from "./Relationship";
import { ConnectedAccount } from "./ConnectedAccount";
import { HTTPError } from "lambert-server";
import { Guild } from "./Guild";

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

@Entity("users")
export class User extends BaseClass {
	@Column()
	username: string; // username max length 32, min 2 (should be configurable)

	@Column()
	discriminator: string; // #0001 4 digit long string from #0001 - #9999

	setDiscriminator(val: string) {
		const number = Number(val);
		if (isNaN(number)) throw new Error("invalid discriminator");
		if (number <= 0 || number > 10000) throw new Error("discriminator must be between 1 and 9999");
		this.discriminator = val.toString();
	}

	@Column()
	avatar?: string; // hash of the user avatar

	@Column()
	accent_color?: number; // banner color of user

	@Column()
	banner?: string; // hash of the user banner

	@Column()
	phone?: string; // phone number of the user

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
	email?: string; // email of the user

	@Column({ type: "bigint" })
	flags: bigint; // UserFlags

	@Column({ type: "bigint" })
	public_flags: bigint;

	@RelationId((user: User) => user.guilds)
	guild_ids: string[]; // array of guild ids the user is part of

	@JoinColumn({ name: "guild_ids" })
	@OneToMany(() => Guild, (guild: Guild) => guild.id)
	guilds: Guild[];

	@RelationId((user: User) => user.relationships)
	relationship_ids: string[]; // array of guild ids the user is part of

	@JoinColumn({ name: "relationship_ids" })
	@OneToMany(() => User, (user: User) => user.id)
	relationships: Relationship[];

	@RelationId((user: User) => user.connected_accounts)
	connected_account_ids: string[]; // array of guild ids the user is part of

	@JoinColumn({ name: "connected_account_ids" })
	@OneToMany(() => ConnectedAccount, (account: ConnectedAccount) => account.id)
	connected_accounts: ConnectedAccount[];

	@Column({ type: "simple-json", select: false })
	data: {
		valid_tokens_since: Date; // all tokens with a previous issue date are invalid
		hash: string; // hash of the password, salt is saved in password (bcrypt)
	};

	@Column({ type: "simple-array" })
	fingerprints: string[]; // array of fingerprints -> used to prevent multiple accounts

	@Column("simple-json")
	settings: UserSettings;

	static async getPublicUser(user_id: string, additional_fields?: any) {
		const user = await User.findOne(
			{ id: user_id },
			{
				...PublicUserProjection,
				...additional_fields,
			}
		);
		if (!user) throw new HTTPError("User not found", 404);
		return user;
	}
}

export interface UserSettings {
	afk_timeout: number;
	allow_accessibility_detection: boolean;
	animate_emoji: boolean;
	animate_stickers: number;
	contact_sync_enabled: boolean;
	convert_emoticons: boolean;
	custom_status: {
		emoji_id?: string;
		emoji_name?: string;
		expires_at?: number;
		text?: string;
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
	// every top guild is displayed as a "folder"
	guild_folders: {
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

// Private user data that should never get sent to the client
export interface PublicUser {
	id: string;
	discriminator: string;
	username: string;
	avatar?: string;
	accent_color?: number;
	banner?: string;
	public_flags: bigint;
	bot: boolean;
}

export class UserFlags extends BitField {
	static FLAGS = {
		DISCORD_EMPLOYEE: BigInt(1) << BigInt(0),
		PARTNERED_SERVER_OWNER: BigInt(1) << BigInt(1),
		HYPESQUAD_EVENTS: BigInt(1) << BigInt(2),
		BUGHUNTER_LEVEL_1: BigInt(1) << BigInt(3),
		HOUSE_BRAVERY: BigInt(1) << BigInt(6),
		HOUSE_BRILLIANCE: BigInt(1) << BigInt(7),
		HOUSE_BALANCE: BigInt(1) << BigInt(8),
		EARLY_SUPPORTER: BigInt(1) << BigInt(9),
		TEAM_USER: BigInt(1) << BigInt(10),
		SYSTEM: BigInt(1) << BigInt(12),
		BUGHUNTER_LEVEL_2: BigInt(1) << BigInt(14),
		VERIFIED_BOT: BigInt(1) << BigInt(16),
		EARLY_VERIFIED_BOT_DEVELOPER: BigInt(1) << BigInt(17),
	};
}
