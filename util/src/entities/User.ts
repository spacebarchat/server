import { Column, Entity, FindOneOptions, JoinColumn, ManyToMany, OneToMany, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { BitField } from "../util/BitField";
import { Relationship } from "./Relationship";
import { ConnectedAccount } from "./ConnectedAccount";
import { Config, FieldErrors, Snowflake, trimSpecial } from "..";
import { Member, Session } from ".";

export enum PublicUserEnum {
	username,
	discriminator,
	id,
	public_flags,
	avatar,
	accent_color,
	banner,
	bio,
	bot,
}
export type PublicUserKeys = keyof typeof PublicUserEnum;

export enum PrivateUserEnum {
	flags,
	mfa_enabled,
	email,
	phone,
	verified,
	nsfw_allowed,
	premium,
	premium_type,
	disabled,
	settings,
	// locale
}
export type PrivateUserKeys = keyof typeof PrivateUserEnum | PublicUserKeys;

export const PublicUserProjection = Object.values(PublicUserEnum).filter(
	(x) => typeof x === "string"
) as PublicUserKeys[];
export const PrivateUserProjection = [
	...PublicUserProjection,
	...Object.values(PrivateUserEnum).filter((x) => typeof x === "string"),
] as PrivateUserKeys[];

// Private user data that should never get sent to the client
export type PublicUser = Pick<User, PublicUserKeys>;

export interface UserPublic extends Pick<User, PublicUserKeys> {}

export interface UserPrivate extends Pick<User, PrivateUserKeys> {
	locale: string;
}

// TODO: add purchased_flags, premium_usage_flags

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
		this.discriminator = val.toString().padStart(4, "0");
	}

	@Column({ nullable: true })
	avatar?: string; // hash of the user avatar

	@Column({ nullable: true })
	accent_color?: number; // banner color of user

	@Column({ nullable: true })
	banner?: string; // hash of the user banner

	@Column({ nullable: true, select: false })
	phone?: string; // phone number of the user

	@Column({ select: false })
	desktop: boolean; // if the user has desktop app installed

	@Column({ select: false })
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

	@Column({ select: false })
	nsfw_allowed: boolean; // if the user is older than 18 (resp. Config)

	@Column({ select: false })
	mfa_enabled: boolean; // if multi factor authentication is enabled

	@Column()
	created_at: Date; // registration date

	@Column({ select: false })
	verified: boolean; // if the user is offically verified

	@Column()
	disabled: boolean; // if the account is disabled

	@Column()
	deleted: boolean; // if the user was deleted

	@Column({ nullable: true, select: false })
	email?: string; // email of the user

	@Column()
	flags: string; // UserFlags

	@Column()
	public_flags: number;

	@Column()
	rights: string; // Rights

	@OneToMany(() => Session, (session: Session) => session.user)
	sessions: Session[];

	@JoinColumn({ name: "relationship_ids" })
	@OneToMany(() => Relationship, (relationship: Relationship) => relationship.from, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	relationships: Relationship[];

	@JoinColumn({ name: "connected_account_ids" })
	@OneToMany(() => ConnectedAccount, (account: ConnectedAccount) => account.user, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	connected_accounts: ConnectedAccount[];

	@Column({ type: "simple-json", select: false })
	data: {
		valid_tokens_since: Date; // all tokens with a previous issue date are invalid
		hash?: string; // hash of the password, salt is saved in password (bcrypt)
	};

	@Column({ type: "simple-array", select: false })
	fingerprints: string[]; // array of fingerprints -> used to prevent multiple accounts

	@Column({ type: "simple-json", select: false })
	settings: UserSettings;

	toPublicUser() {
		const user: any = {};
		PublicUserProjection.forEach((x) => {
			user[x] = this[x];
		});
		return user as PublicUser;
	}

	static async getPublicUser(user_id: string, opts?: FindOneOptions<User>) {
		return await User.findOneOrFail(
			{ id: user_id },
			{
				...opts,
				select: [...PublicUserProjection, ...(opts?.select || [])],
			}
		);
	}

	static async register({
		email,
		username,
		password,
		date_of_birth,
		req,
	}: {
		username: string;
		password?: string;
		email?: string;
		date_of_birth?: Date; // "2000-04-03"
		req?: any;
	}) {
		// trim special uf8 control characters -> Backspace, Newline, ...
		username = trimSpecial(username);

		// discriminator will be randomly generated
		let discriminator = "";

		let exists;
		// randomly generates a discriminator between 1 and 9999 and checks max five times if it already exists
		// if it all five times already exists, abort with USERNAME_TOO_MANY_USERS error
		// else just continue
		// TODO: is there any better way to generate a random discriminator only once, without checking if it already exists in the database?
		for (let tries = 0; tries < 5; tries++) {
			discriminator = Math.randomIntBetween(1, 9999).toString().padStart(4, "0");
			exists = await User.findOne({ where: { discriminator, username: username }, select: ["id"] });
			if (!exists) break;
		}

		if (exists) {
			throw FieldErrors({
				username: {
					code: "USERNAME_TOO_MANY_USERS",
					message: req.t("auth:register.USERNAME_TOO_MANY_USERS"),
				},
			});
		}

		// TODO: save date_of_birth
		// appearently discord doesn't save the date of birth and just calculate if nsfw is allowed
		// if nsfw_allowed is null/undefined it'll require date_of_birth to set it to true/false
		const language = req.language === "en" ? "en-US" : req.language || "en-US";

		const user = new User({
			created_at: new Date(),
			username: username,
			discriminator,
			id: Snowflake.generate(),
			bot: false,
			system: false,
			desktop: false,
			mobile: false,
			premium: true,
			premium_type: 2,
			bio: "",
			mfa_enabled: false,
			verified: true,
			disabled: false,
			deleted: false,
			email: email,
			rights: "0",
			nsfw_allowed: true, // TODO: depending on age
			public_flags: "0",
			flags: "0", // TODO: generate
			data: {
				hash: password,
				valid_tokens_since: new Date(),
			},
			settings: { ...defaultSettings, locale: language },
			fingerprints: [],
		});

		await user.save();

		setImmediate(async () => {
			if (Config.get().guild.autoJoin.enabled) {
				for (const guild of Config.get().guild.autoJoin.guilds || []) {
					await Member.addToGuild(user.id, guild).catch((e) => {});
				}
			}
		});

		return user;
	}
}

export const defaultSettings: UserSettings = {
	afk_timeout: 300,
	allow_accessibility_detection: true,
	animate_emoji: true,
	animate_stickers: 0,
	contact_sync_enabled: false,
	convert_emoticons: false,
	custom_status: {
		emoji_id: undefined,
		emoji_name: undefined,
		expires_at: undefined,
		text: undefined,
	},
	default_guilds_restricted: false,
	detect_platform_accounts: true,
	developer_mode: false,
	disable_games_tab: false,
	enable_tts_command: true,
	explicit_content_filter: 0,
	friend_source_flags: { all: true },
	gateway_connected: false,
	gif_auto_play: true,
	guild_folders: [],
	guild_positions: [],
	inline_attachment_media: true,
	inline_embed_media: true,
	locale: "en-US",
	message_display_compact: false,
	native_phone_integration_enabled: true,
	render_embeds: true,
	render_reactions: true,
	restricted_guilds: [],
	show_current_game: true,
	status: "online",
	stream_notifications_enabled: true,
	theme: "dark",
	timezone_offset: 0,
	// timezone_offset: // TODO: timezone from request
};

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

export const CUSTOM_USER_FLAG_OFFSET = BigInt(1) << BigInt(32);

export class UserFlags extends BitField {
	static FLAGS = {
		DISCORD_EMPLOYEE: BigInt(1) << BigInt(0),
		PARTNERED_SERVER_OWNER: BigInt(1) << BigInt(1),
		HYPESQUAD_EVENTS: BigInt(1) << BigInt(2),
		BUGHUNTER_LEVEL_1: BigInt(1) << BigInt(3),
		MFA_SMS: BigInt(1) << BigInt(4),
		PREMIUM_PROMO_DISMISSED: BigInt(1) << BigInt(5),
		HOUSE_BRAVERY: BigInt(1) << BigInt(6),
		HOUSE_BRILLIANCE: BigInt(1) << BigInt(7),
		HOUSE_BALANCE: BigInt(1) << BigInt(8),
		EARLY_SUPPORTER: BigInt(1) << BigInt(9),
		TEAM_USER: BigInt(1) << BigInt(10),
		TRUST_AND_SAFETY: BigInt(1) << BigInt(11),
		SYSTEM: BigInt(1) << BigInt(12),
		HAS_UNREAD_URGENT_MESSAGES: BigInt(1) << BigInt(13),
		BUGHUNTER_LEVEL_2: BigInt(1) << BigInt(14),
		UNDERAGE_DELETED: BigInt(1) << BigInt(15),
		VERIFIED_BOT: BigInt(1) << BigInt(16),
		EARLY_VERIFIED_BOT_DEVELOPER: BigInt(1) << BigInt(17),
		CERTIFIED_MODERATOR: BigInt(1) << BigInt(18),
		BOT_HTTP_INTERACTIONS: BigInt(1) << BigInt(19),
	};
}
