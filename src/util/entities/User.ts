import { Column, Entity, FindOneOptions, FindOptionsSelectByString, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Member, Session, UserSettings } from ".";
import { Config, FieldErrors, Snowflake, trimSpecial } from "..";
import { BitField } from "../util/BitField";
import { OrmUtils } from "../util/imports/OrmUtils";
import { BaseClass } from "./BaseClass";
import { ConnectedAccount } from "./ConnectedAccount";
import { Relationship } from "./Relationship";

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
	premium_since
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
	settings
	// locale
}
export type PrivateUserKeys = keyof typeof PrivateUserEnum | PublicUserKeys;

export const PublicUserProjection = Object.values(PublicUserEnum).filter((x) => typeof x === "string") as PublicUserKeys[];
export const PrivateUserProjection = [
	...PublicUserProjection,
	...Object.values(PrivateUserEnum).filter((x) => typeof x === "string")
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
	discriminator: string; // opaque string: 4 digits on discord.com

	setDiscriminator(val: string) {
		const number = Number(val);
		if (isNaN(number)) throw new Error("invalid discriminator");
		if (number <= 0 || number >= 10000) throw new Error("discriminator must be between 1 and 9999");
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
	desktop: boolean = false; // if the user has desktop app installed

	@Column({ select: false })
	mobile: boolean = false; // if the user has mobile app installed

	@Column()
	premium: boolean = Config.get().defaults.user.premium; // if user bought individual premium

	@Column()
	premium_type: number = Config.get().defaults.user.premium_type; // individual premium level

	@Column()
	bot: boolean = false; // if user is bot

	@Column({ nullable: true })
	bio: string; // short description of the user (max 190 chars -> should be configurable)

	@Column()
	system: boolean = false; // shouldn't be used, the api sends this field type true, if the generated message comes from a system generated author

	@Column({ select: false })
	nsfw_allowed: boolean = true; // if the user can do age-restricted actions (NSFW channels/guilds/commands) // TODO: depending on age

	@Column({ select: false, nullable: true })
	mfa_enabled: boolean; // if multi factor authentication is enabled

	@Column({ select: false, nullable: true })
	totp_secret?: string;

	@Column({ nullable: true, select: false })
	totp_last_ticket?: string;

	@Column()
	created_at: Date = new Date(); // registration date

	@Column({ nullable: true })
	premium_since: Date = new Date(); // premium date

	@Column({ select: false })
	verified: boolean = Config.get().defaults.user.verified; // if the user is offically verified

	@Column()
	disabled: boolean = false; // if the account is disabled

	@Column()
	deleted: boolean = false; // if the user was deleted

	@Column({ nullable: true, select: false })
	email?: string; // email of the user

	@Column()
	flags: string = "0"; // UserFlags // TODO: generate

	@Column()
	public_flags: number = 0;

	@Column({ type: "bigint" })
	rights: string = Config.get().register.defaultRights; // Rights

	@OneToMany(() => Session, (session: Session) => session.user)
	sessions: Session[];

	@JoinColumn({ name: "relationship_ids" })
	@OneToMany(() => Relationship, (relationship: Relationship) => relationship.from, {
		cascade: true,
		orphanedRowAction: "delete"
	})
	relationships: Relationship[];

	@JoinColumn({ name: "connected_account_ids" })
	@OneToMany(() => ConnectedAccount, (account: ConnectedAccount) => account.user, {
		cascade: true,
		orphanedRowAction: "delete"
	})
	connected_accounts: ConnectedAccount[];

	@Column({ type: "simple-json", select: false })
	data: {
		valid_tokens_since: Date; // all tokens with a previous issue date are invalid
		hash?: string; // hash of the password, salt is saved in password (bcrypt)
	};

	@Column({ type: "simple-array", select: false })
	fingerprints: string[] = []; // array of fingerprints -> used to prevent multiple accounts

	@OneToOne(() => UserSettings, {
		cascade: true,
		orphanedRowAction: "delete",
		eager: false
	})
	@JoinColumn()
	settings: UserSettings;

	// workaround to prevent fossord-unaware clients from deleting settings not used by them
	@Column({ type: "simple-json", select: false })
	extended_settings: string = "{}";

	@Column({ type: "simple-json" })
	notes: { [key: string]: string } = {}; //key is ID of user

	async save(): Promise<any> {
		if (!this.settings) this.settings = new UserSettings();
		this.settings.id = this.id;
		//await this.settings.save();
		return super.save();
	}

	toPublicUser() {
		const user: any = {};
		PublicUserProjection.forEach((x) => {
			user[x] = this[x];
		});
		return user as PublicUser;
	}

	static async getPublicUser(user_id: string, opts?: FindOneOptions<User>) {
		return await User.findOneOrFail({
			where: { id: user_id },
			select: [...PublicUserProjection, ...((opts?.select as FindOptionsSelectByString<User>) || [])],
			...opts
		});
	}

	public static async generateDiscriminator(username: string): Promise<string | undefined> {
		if (Config.get().register.incrementingDiscriminators) {
			// discriminator will be incrementally generated

			// First we need to figure out the currently highest discrimnator for the given username and then increment it
			const users = await User.find({ where: { username }, select: ["discriminator"] });
			const highestDiscriminator = Math.max(0, ...users.map((u) => Number(u.discriminator)));

			const discriminator = highestDiscriminator + 1;
			if (discriminator >= 10000) {
				return undefined;
			}

			return discriminator.toString().padStart(4, "0");
		} else {
			// discriminator will be randomly generated

			// randomly generates a discriminator between 1 and 9999 and checks max five times if it already exists
			// TODO: is there any better way to generate a random discriminator only once, without checking if it already exists in the database?
			for (let tries = 0; tries < 5; tries++) {
				const discriminator = Math.randomIntBetween(1, 9999).toString().padStart(4, "0");
				const exists = await User.findOne({ where: { discriminator, username: username }, select: ["id"] });
				if (!exists) return discriminator;
			}

			return undefined;
		}
	}

	static async register({
		email,
		username,
		password,
		date_of_birth,
		req
	}: {
		username: string;
		password?: string;
		email?: string;
		date_of_birth?: Date; // "2000-04-03"
		req?: any;
	}) {
		// trim special uf8 control characters -> Backspace, Newline, ...
		username = trimSpecial(username);

		const discriminator = await User.generateDiscriminator(username);
		if (!discriminator) {
			// We've failed to generate a valid and unused discriminator
			throw FieldErrors({
				username: {
					code: "USERNAME_TOO_MANY_USERS",
					message: req?.t("auth:register.USERNAME_TOO_MANY_USERS")
				}
			});
		}

		// TODO: save date_of_birth
		// appearently discord doesn't save the date of birth and just calculate if nsfw is allowed
		// if nsfw_allowed is null/undefined it'll require date_of_birth to set it to true/false
		const language = req?.language === "en" ? "en-US" : req?.language || "en-US";

		const user = OrmUtils.mergeDeep(new User(), {
			//required:
			username: username,
			discriminator,
			id: Snowflake.generate(),
			email: email,
			data: {
				hash: password,
				valid_tokens_since: new Date()
			},
			settings: { ...new UserSettings(), locale: language }
		});

		//await (user.settings as UserSettings).save();
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
		BOT_HTTP_INTERACTIONS: BigInt(1) << BigInt(19)
	};
}
