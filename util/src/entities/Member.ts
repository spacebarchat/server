import { PublicUser, User } from "./User";
import { BaseClass } from "./BaseClass";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, RelationId } from "typeorm";
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

@Entity("members")
export class Member extends BaseClass {
	@RelationId((member: Member) => member.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@RelationId((member: Member) => member.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@Column({ nullable: true })
	nick?: string;

	@RelationId((member: Member) => member.roles)
	role_ids: string[];

	@JoinColumn({ name: "role_ids" })
	@ManyToMany(() => Role)
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

	@Column({ type: "simple-json" })
	settings: UserGuildSettings;

	// TODO: update
	@Column({ type: "simple-json" })
	read_state: Record<string, string | null>;

	static async IsInGuildOrFail(user_id: string, guild_id: string) {
		if (await Member.count({ id: user_id, guild_id })) return true;
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
				guild_id: guild_id,
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
				data: {
					guild_id: guild_id,
					user: member.user,
				},
				guild_id: guild_id,
			} as GuildMemberRemoveEvent),
		]);
	}

	static async addRole(user_id: string, guild_id: string, role_id: string) {
		const [member] = await Promise.all([
			Member.findOneOrFail({
				where: { id: user_id, guild_id: guild_id },
				relations: ["user"], // we don't want to load  the role objects just the ids
			}),
			await Role.findOneOrFail({ id: role_id, guild_id: guild_id }),
		]);
		member.role_ids.push(role_id);
		member.save();

		await emitEvent({
			event: "GUILD_MEMBER_UPDATE",
			data: {
				guild_id: guild_id,
				user: member.user,
				roles: member.role_ids,
			},
			guild_id: guild_id,
		} as GuildMemberUpdateEvent);
	}

	static async removeRole(user_id: string, guild_id: string, role_id: string) {
		const [member] = await Promise.all([
			Member.findOneOrFail({
				where: { id: user_id, guild_id: guild_id },
				relations: ["user"], // we don't want to load  the role objects just the ids
			}),
			await Role.findOneOrFail({ id: role_id, guild_id: guild_id }),
		]);
		member.role_ids.remove(role_id);
		member.save();

		await emitEvent({
			event: "GUILD_MEMBER_UPDATE",
			data: {
				guild_id: guild_id,
				user: member.user,
				roles: member.role_ids,
			},
			guild_id: guild_id,
		} as GuildMemberUpdateEvent);
	}

	static async changeNickname(user_id: string, guild_id: string, nickname: string) {
		const member = await Member.findOneOrFail({
			where: {
				id: user_id,
				guild_id: guild_id,
			},
			relations: ["user"],
		});
		member.nick = nickname;

		await Promise.all([
			member.save(),

			emitEvent({
				event: "GUILD_MEMBER_UPDATE",
				data: {
					guild_id: guild_id,
					user: member.user,
					nick: nickname,
				},
				guild_id: guild_id,
			} as GuildMemberUpdateEvent),
		]);
	}

	static async addToGuild(user_id: string, guild_id: string) {
		const user = await User.getPublicUser(user_id);

		const { maxGuilds } = Config.get().limits.user;
		const guild_count = await Member.count({ id: user_id });
		if (guild_count >= maxGuilds) {
			throw new HTTPError(`You are at the ${maxGuilds} server limit.`, 403);
		}

		const guild = await Guild.findOneOrFail(guild_id, {
			relations: ["channels", "emojis", "members", "roles", "stickers"],
		});

		if (await Member.count({ id: user.id, guild_id }))
			throw new HTTPError("You are already a member of this guild", 400);

		const member = {
			id: user_id,
			guild_id: guild_id,
			nick: undefined,
			roles: [guild_id], // @everyone role
			joined_at: new Date(),
			premium_since: undefined,
			deaf: false,
			mute: false,
			pending: false,
		};
		// @ts-ignore
		guild.joined_at = member.joined_at;

		await Promise.all([
			new Member({
				...member,
				read_state: {},
				settings: {
					channel_overrides: [],
					message_notifications: 0,
					mobile_push: true,
					mute_config: null,
					muted: false,
					suppress_everyone: false,
					suppress_roles: false,
					version: 0,
				},
			}).save(),
			Guild.increment({ id: guild_id }, "member_count", 1),
			emitEvent({
				event: "GUILD_MEMBER_ADD",
				data: {
					...member,
					user,
					guild_id: guild_id,
				},
				guild_id: guild_id,
			} as GuildMemberAddEvent),
			emitEvent({
				event: "GUILD_CREATE",
				data: guild,
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
