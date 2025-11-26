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

import { Request } from "express";
import { Column, Entity, FindOneOptions, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Channel, Config, Email, FieldErrors, Snowflake, trimSpecial } from "..";
import { Random } from "../util";
import { BaseClass } from "./BaseClass";
import { ConnectedAccount } from "./ConnectedAccount";
import { Member } from "./Member";
import { Relationship } from "./Relationship";
import { SecurityKey } from "./SecurityKey";
import { Session } from "./Session";
import { UserSettings } from "./UserSettings";
import { ChannelType, PrivateUserProjection, PublicUser, PublicUserProjection, UserPrivate } from "@spacebar/schemas";

@Entity({
	name: "users",
})
export class User extends BaseClass {
	@Column()
	username: string; // username max length 32, min 2 (should be configurable)

	@Column()
	discriminator: string; // opaque string: 4 digits on discord.com

	@Column({ nullable: true })
	avatar?: string; // hash of the user avatar

	@Column({ nullable: true })
	accent_color?: number; // banner color of user

	@Column({ nullable: true })
	banner?: string; // hash of the user banner

	// TODO: Separate `User` and `UserProfile` models
	// puyo: changed from [number, number] because it breaks openapi
	@Column({ nullable: true, type: "simple-array" })
	theme_colors?: number[];

	@Column({ nullable: true })
	pronouns?: string;

	@Column({ nullable: true, select: false })
	phone?: string; // phone number of the user

	@Column({ select: false })
	desktop: boolean = false; // if the user has desktop app installed

	@Column({ select: false })
	mobile: boolean = false; // if the user has mobile app installed

	@Column()
	premium: boolean; // if user bought individual premium

	@Column()
	premium_type: number; // individual premium level

	@Column()
	bot: boolean = false; // if user is bot

	@Column()
	bio: string = ""; // short description of the user

	@Column()
	system: boolean = false; // shouldn't be used, the api sends this field type true, if the generated message comes from a system generated author

	@Column({ select: false })
	nsfw_allowed: boolean = true; // if the user can do age-restricted actions (NSFW channels/guilds/commands) // TODO: depending on age

	@Column({ select: false })
	mfa_enabled: boolean = false; // if multi factor authentication is enabled

	@Column({ select: false, default: false })
	webauthn_enabled: boolean = false; // if webauthn multi factor authentication is enabled

	@Column({ select: false, nullable: true })
	totp_secret?: string = "";

	@Column({ nullable: true, select: false })
	totp_last_ticket?: string = "";

	@Column()
	created_at: Date; // registration date

	@Column({ nullable: true })
	premium_since: Date; // premium date

	@Column({ select: false })
	verified: boolean; // email is verified

	@Column()
	disabled: boolean = false; // if the account is disabled

	@Column()
	deleted: boolean = false; // if the user was deleted

	@Column({ nullable: true, select: false })
	email?: string; // email of the user

	@Column({ type: "bigint" })
	flags: number = 0; // UserFlags // TODO: generate

	@Column({ type: "bigint" })
	public_flags: number = 0;

	@Column({ type: "bigint" })
	purchased_flags: number = 0;

	@Column()
	premium_usage_flags: number = 0;

	@Column({ type: "bigint" })
	rights: string;

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
	fingerprints: string[] = []; // array of fingerprints -> used to prevent multiple accounts

	@OneToOne(() => UserSettings, {
		cascade: true,
		orphanedRowAction: "delete",
		nullable: true,
	})
	@JoinColumn()
	settings?: UserSettings;

	// workaround to prevent fossord-unaware clients from deleting settings not used by them
	@Column({ type: "simple-json", select: false })
	extended_settings: string = "{}";

	@OneToMany(() => SecurityKey, (key: SecurityKey) => key.user)
	security_keys: SecurityKey[];

	@Column({ type: "simple-array", nullable: true })
	badge_ids?: string[];

	// TODO: I don't like this method?
	validate() {
		if (this.discriminator) {
			const discrim = Number(this.discriminator);
			if (isNaN(discrim) || !(typeof discrim == "number") || !Number.isInteger(discrim) || discrim <= 0 || discrim >= 10000)
				throw FieldErrors({
					discriminator: {
						message: "Discriminator must be a number.",
						code: "DISCRIMINATOR_INVALID",
					},
				});

			this.discriminator = discrim.toString().padStart(4, "0");
		}
	}

	toPublicUser() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const user: any = {};
		PublicUserProjection.forEach((x) => {
			user[x] = this[x];
		});
		return user as PublicUser;
	}

	toPrivateUser(extraFields: (keyof User)[] = []) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const user: any = {};
		[...PrivateUserProjection, ...extraFields].forEach((x) => {
			user[x] = this[x];
		});
		return user as UserPrivate;
	}

	static async getPublicUser(user_id: string, opts?: FindOneOptions<User>) {
		return await User.findOneOrFail({
			where: { id: user_id },
			...opts,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			select: [...PublicUserProjection, ...(opts?.select || [])], // TODO: fix
		});
	}

	public static async generateDiscriminator(username: string): Promise<string | undefined> {
		if (Config.get().register.incrementingDiscriminators) {
			// discriminator will be incrementally generated

			// First we need to figure out the currently highest discrimnator for the given username and then increment it
			const users = await User.find({
				where: { username },
				select: ["discriminator"],
			});
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
				const discriminator = Random.nextInt(1, 9999).toString().padStart(4, "0");
				const exists = await User.findOne({
					where: { discriminator, username: username },
					select: ["id"],
				});
				if (!exists) return discriminator;
			}

			return undefined;
		}
	}

	static async register({
		email,
		username,
		password,
		id,
		req,
		bot,
	}: {
		username: string;
		password?: string;
		email?: string;
		date_of_birth?: Date; // "2000-04-03"
		id?: string;
		req?: Request;
		bot?: boolean;
	}) {
		// trim special uf8 control characters -> Backspace, Newline, ...
		username = trimSpecial(username);

		const discriminator = await User.generateDiscriminator(username);
		if (!discriminator) {
			// We've failed to generate a valid and unused discriminator
			throw FieldErrors({
				username: {
					code: "USERNAME_TOO_MANY_USERS",
					message: req?.t("auth:register.USERNAME_TOO_MANY_USERS") || "",
				},
			});
		}

		// TODO: save date_of_birth
		// apparently discord doesn't save the date of birth and just calculate if nsfw is allowed
		// if nsfw_allowed is null/undefined it'll require date_of_birth to set it to true/false
		const language = req?.language === "en" ? "en-US" : req?.language || "en-US";

		const settings = UserSettings.create({
			locale: language,
		});

		const user = User.create({
			username: username,
			discriminator,
			id: id || Snowflake.generate(),
			email: email,
			data: {
				hash: password,
				valid_tokens_since: new Date(),
			},
			extended_settings: "{}",
			settings: settings,

			premium_since: Config.get().defaults.user.premium ? new Date() : undefined,
			rights: Config.get().register.defaultRights,
			premium: Config.get().defaults.user.premium ?? false,
			premium_type: Config.get().defaults.user.premiumType ?? 0,
			verified: Config.get().defaults.user.verified ?? true,
			created_at: new Date(),
			bot: !!bot,
		});

		user.validate();
		await Promise.all([user.save(), settings.save()]);

		// send verification email if users aren't verified by default and we have an email
		if (!Config.get().defaults.user.verified && email) {
			await Email.sendVerifyEmail(user, email).catch((e) => {
				console.error(`Failed to send verification email to ${user.username}#${user.discriminator}: ${e}`);
			});
		}

		setImmediate(async () => {
			if (bot) {
				const { guild } = Config.get();
				if (!guild.autoJoin.bots) {
					return;
				}
			}
			if (Config.get().guild.autoJoin.enabled) {
				for (const guild of Config.get().guild.autoJoin.guilds || []) {
					await Member.addToGuild(user.id, guild).catch((e) => console.error("[Autojoin]", e));
				}
			}
		});

		return user;
	}

	async getDmChannelWith(user_id: string) {
		const qry = await Channel.getRepository()
			.createQueryBuilder()
			.leftJoinAndSelect("Channel.recipients", "rcp")
			.where("Channel.type = :type", { type: ChannelType.DM })
			.andWhere("rcp.user_id IN (:...user_ids)", { user_ids: [this.id, user_id] })
			.groupBy("Channel.id")
			.having("COUNT(rcp.user_id) = 2")
			.getMany();

		// Emma [it/its]@Rory&: is this technically a bug, or am I being too over-cautious?
		if (qry.length > 1) {
			console.warn(`[WARN] User(${this.id})#getDmChannel(${user_id}) returned multiple channels:`);
			for (const channel of qry) {
				console.warn(JSON.stringify(channel));
			}
			throw new Error("Array contains more than one matching element");
		}

		return qry[0];
	}
}
