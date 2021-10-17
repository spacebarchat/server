import { PublicUser, User } from "./User";
import { BaseClass } from "./BaseClass";
import {
	Column,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from "typeorm";
import { Guild } from "./Guild";
import { Config, emitEvent } from "../util";
import {
	GuildCreateEvent,
	GuildDeleteEvent,
	GuildMemberAddEvent,
	GuildMemberRemoveEvent,
	GuildMemberUpdateEvent,
} from "../interfaces";
import { HTTPError } from "lambert-server";
import { Role } from "./Role";
import { BaseClassWithoutId } from "./BaseClass";
import { Ban, PublicGuildRelations } from ".";
import { DiscordApiErrors } from "../util/Constants";

export const MemberPrivateProjection: (keyof Member)[] = [
	"id",
	"guild",
	"guild_id",
	"deaf",
	"joined_at",
	"last_message_id",
	"mute",
	"nick",
	"pending",
	"premium_since",
	"roles",
	"settings",
	"user",
];

@Entity("members")
@Index(["id", "guild_id"], { unique: true })
export class Member extends BaseClassWithoutId {
	@PrimaryGeneratedColumn()
	index: string;

	@Column()
	@RelationId((member: Member) => member.user)
	id: string;

	@JoinColumn({ name: "id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column()
	@RelationId((member: Member) => member.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column({ nullable: true })
	nick?: string;

	@JoinTable({
		name: "member_roles",
		joinColumn: { name: "index", referencedColumnName: "index" },
		inverseJoinColumn: {
			name: "role_id",
			referencedColumnName: "id",
		},
	})
	@ManyToMany(() => Role, { cascade: true })
	roles: Role[];

	@Column()
	joined_at: Date;

	@Column({ nullable: true })
	premium_since?: number;

	@Column()
	deaf: boolean;

	@Column()
	mute: boolean;

	@Column()
	pending: boolean;

	@Column({ type: "simple-json", select: false })
	settings: UserGuildSettings;

	@Column({ nullable: true })
	last_message_id?: string;

	// TODO: update
	// @Column({ type: "simple-json" })
	// read_state: ReadState;

	static async IsInGuildOrFail(user_id: string, guild_id: string) {
		if (await Member.count({ id: user_id, guild: { id: guild_id } })) return true;
		throw new HTTPError("You are not member of this guild", 403);
	}

	static async removeFromGuild(user_id: string, guild_id: string) {
		const guild = await Guild.findOneOrFail({ select: ["owner_id"], where: { id: guild_id } });
		if (guild.owner_id === user_id) throw new Error("The owner cannot be removed of the guild");
		const member = await Member.findOneOrFail({ where: { id: user_id, guild_id }, relations: ["user"] });

		// use promise all to execute all promises at the same time -> save time
		return Promise.all([
			Member.delete({
				id: user_id,
				guild_id,
			}),
			Guild.decrement({ id: guild_id }, "member_count", -1),

			emitEvent({
				event: "GUILD_DELETE",
				data: {
					id: guild_id,
				},
				user_id: user_id,
			} as GuildDeleteEvent),
			emitEvent({
				event: "GUILD_MEMBER_REMOVE",
				data: { guild_id, user: member.user },
				guild_id,
			} as GuildMemberRemoveEvent),
		]);
	}

	static async addRole(user_id: string, guild_id: string, role_id: string) {
		const [member, role] = await Promise.all([
			// @ts-ignore
			Member.findOneOrFail({
				where: { id: user_id, guild_id },
				relations: ["user", "roles"], // we don't want to load  the role objects just the ids
				select: ["index", "roles.id"],
			}),
			Role.findOneOrFail({ where: { id: role_id, guild_id }, select: ["id"] }),
		]);
		member.roles.push(new Role({ id: role_id }));

		await Promise.all([
			member.save(),
			emitEvent({
				event: "GUILD_MEMBER_UPDATE",
				data: {
					guild_id,
					user: member.user,
					roles: member.roles.map((x) => x.id),
				},
				guild_id,
			} as GuildMemberUpdateEvent),
		]);
	}

	static async removeRole(user_id: string, guild_id: string, role_id: string) {
		const [member] = await Promise.all([
			// @ts-ignore
			Member.findOneOrFail({
				where: { id: user_id, guild_id },
				relations: ["user", "roles"], // we don't want to load  the role objects just the ids
				select: ["roles.id", "index"],
			}),
			await Role.findOneOrFail({ id: role_id, guild_id }),
		]);
		member.roles = member.roles.filter((x) => x.id == role_id);

		await Promise.all([
			member.save(),
			emitEvent({
				event: "GUILD_MEMBER_UPDATE",
				data: {
					guild_id,
					user: member.user,
					roles: member.roles.map((x) => x.id),
				},
				guild_id,
			} as GuildMemberUpdateEvent),
		]);
	}

	static async changeNickname(user_id: string, guild_id: string, nickname: string) {
		const member = await Member.findOneOrFail({
			where: {
				id: user_id,
				guild_id,
			},
			relations: ["user"],
		});
		member.nick = nickname;

		await Promise.all([
			member.save(),

			emitEvent({
				event: "GUILD_MEMBER_UPDATE",
				data: {
					guild_id,
					user: member.user,
					nick: nickname,
				},
				guild_id,
			} as GuildMemberUpdateEvent),
		]);
	}

	static async addToGuild(user_id: string, guild_id: string) {
		const user = await User.getPublicUser(user_id);
		const isBanned = await Ban.count({ where: { guild_id, user_id } });
		if (isBanned) {
			throw DiscordApiErrors.USER_BANNED;
		}
		const { maxGuilds } = Config.get().limits.user;
		const guild_count = await Member.count({ id: user_id });
		if (guild_count >= maxGuilds) {
			throw new HTTPError(`You are at the ${maxGuilds} server limit.`, 403);
		}

		const guild = await Guild.findOneOrFail({
			where: {
				id: guild_id,
			},
			relations: PublicGuildRelations,
		});

		if (await Member.count({ id: user.id, guild: { id: guild_id } }))
			throw new HTTPError("You are already a member of this guild", 400);

		const member = {
			id: user_id,
			guild_id,
			nick: undefined,
			roles: [guild_id], // @everyone role
			joined_at: new Date(),
			premium_since: undefined,
			deaf: false,
			mute: false,
			pending: false,
		};

		await Promise.all([
			new Member({
				...member,
				roles: [new Role({ id: guild_id })],
				// read_state: {},
				settings: {
					channel_overrides: [],
					message_notifications: 0,
					mobile_push: true,
					muted: false,
					suppress_everyone: false,
					suppress_roles: false,
					version: 0,
				},
				// Member.save is needed because else the roles relations wouldn't be updated
			}).save(),
			Guild.increment({ id: guild_id }, "member_count", 1),
			emitEvent({
				event: "GUILD_MEMBER_ADD",
				data: {
					...member,
					user,
					guild_id,
				},
				guild_id,
			} as GuildMemberAddEvent),
			emitEvent({
				event: "GUILD_CREATE",
				data: {
					...guild,
					members: [...guild.members, { ...member, user }],
					member_count: (guild.member_count || 0) + 1,
					guild_hashes: {},
					guild_scheduled_events: [],
					joined_at: member.joined_at,
					presences: [],
					stage_instances: [],
					threads: [],
				},
				user_id,
			} as GuildCreateEvent),
		]);
	}
}

export interface UserGuildSettings {
	channel_overrides: {
		channel_id: string;
		message_notifications: number;
		mute_config: MuteConfig;
		muted: boolean;
	}[];
	message_notifications: number;
	mobile_push: boolean;
	mute_config: MuteConfig;
	muted: boolean;
	suppress_everyone: boolean;
	suppress_roles: boolean;
	version: number;
}

export interface MuteConfig {
	end_time: number;
	selected_time_window: number;
}

export type PublicMemberKeys =
	| "id"
	| "guild_id"
	| "nick"
	| "roles"
	| "joined_at"
	| "pending"
	| "deaf"
	| "mute"
	| "premium_since";

export const PublicMemberProjection: PublicMemberKeys[] = [
	"id",
	"guild_id",
	"nick",
	"roles",
	"joined_at",
	"pending",
	"deaf",
	"mute",
	"premium_since",
];

// @ts-ignore
export type PublicMember = Pick<Member, Omit<PublicMemberKeys, "roles">> & {
	user: PublicUser;
	roles: string[]; // only role ids not objects
};
