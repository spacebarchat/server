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

import { HTTPError } from "lambert-server";
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	Not,
	PrimaryGeneratedColumn,
	RelationId,
} from "typeorm";
import { Ban, Channel, PublicGuildRelations } from ".";
import { ReadyGuildDTO } from "../dtos";
import {
	GuildCreateEvent,
	GuildDeleteEvent,
	GuildMemberAddEvent,
	GuildMemberRemoveEvent,
	GuildMemberUpdateEvent,
	MessageCreateEvent,
} from "../interfaces";
import { Config, emitEvent } from "../util";
import { DiscordApiErrors } from "../util/Constants";
import { BaseClassWithoutId } from "./BaseClass";
import { Guild } from "./Guild";
import { Message } from "./Message";
import { Role } from "./Role";
import { PublicUser, User } from "./User";

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

@Entity({name: "members", engine: "InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"})
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

	@Column({ type: "bigint", nullable: true })
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

	/**
	@JoinColumn({ name: "id" })
	@ManyToOne(() => User, {
		onDelete: "DO NOTHING",
	// do not auto-kick force-joined members just because their joiners left the server
	}) **/
	@Column({ nullable: true })
	joined_by: string;

	@Column({ nullable: true })
	avatar?: string;

	@Column({ nullable: true })
	banner: string;

	@Column()
	bio: string;

	@Column({ nullable: true, type: "simple-array" })
	theme_colors?: number[]; // TODO: Separate `User` and `UserProfile` models

	@Column({ nullable: true })
	pronouns?: string;

	@Column({ nullable: true })
	communication_disabled_until: Date;

	// TODO: add this when we have proper read receipts
	// @Column({ type: "simple-json" })
	// read_state: ReadState;

	@BeforeUpdate()
	@BeforeInsert()
	validate() {
		if (this.nick) {
			this.nick = this.nick.split("\n").join("");
			this.nick = this.nick.split("\t").join("");
		}
	}

	static async IsInGuildOrFail(user_id: string, guild_id: string) {
		if (
			await Member.count({
				where: { id: user_id, guild: { id: guild_id } },
			})
		)
			return true;
		throw new HTTPError("You are not member of this guild", 403);
	}

	static async removeFromGuild(user_id: string, guild_id: string) {
		const guild = await Guild.findOneOrFail({
			select: ["owner_id"],
			where: { id: guild_id },
		});
		if (guild.owner_id === user_id)
			throw new Error("The owner cannot be removed of the guild");
		const member = await Member.findOneOrFail({
			where: { id: user_id, guild_id },
			relations: ["user"],
		});

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
		const [member] = await Promise.all([
			Member.findOneOrFail({
				where: { id: user_id, guild_id },
				relations: ["user", "roles"], // we don't want to load  the role objects just the ids
				select: {
					index: true,
					roles: {
						id: true,
					},
				},
			}),
			Role.findOneOrFail({
				where: { id: role_id, guild_id },
				select: ["id"],
			}),
		]);
		member.roles.push(Role.create({ id: role_id }));

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

	static async removeRole(
		user_id: string,
		guild_id: string,
		role_id: string,
	) {
		const [member] = await Promise.all([
			Member.findOneOrFail({
				where: { id: user_id, guild_id },
				relations: ["user", "roles"], // we don't want to load  the role objects just the ids
				select: {
					index: true,
					roles: {
						id: true,
					},
				},
			}),
			Role.findOneOrFail({ where: { id: role_id, guild_id } }),
		]);
		member.roles = member.roles.filter((x) => x.id !== role_id);

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

	static async changeNickname(
		user_id: string,
		guild_id: string,
		nickname: string,
	) {
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
		const guild_count = await Member.count({ where: { id: user_id } });
		if (guild_count >= maxGuilds) {
			throw new HTTPError(
				`You are at the ${maxGuilds} server limit.`,
				403,
			);
		}

		const guild = await Guild.findOneOrFail({
			where: {
				id: guild_id,
			},
			relations: PublicGuildRelations,
			relationLoadStrategy: "query",
		});

		for await (const channel of guild.channels) {
			channel.position = await Channel.calculatePosition(
				channel.id,
				guild_id,
			);
		}

		const memberCount = await Member.count({ where: { guild_id } });

		const memberPreview = (
			await Member.find({
				where: {
					guild_id,
					user: {
						sessions: {
							status: Not("invisible" as const), // lol typescript?
						},
					},
				},
				relations: ["user", "roles"],
				take: 10,
			})
		).map((member) => member.toPublicMember());

		if (
			await Member.count({
				where: { id: user.id, guild: { id: guild_id } },
			})
		)
			throw new HTTPError("You are already a member of this guild", 400);

		const member = {
			id: user_id,
			guild_id,
			nick: undefined,
			roles: [guild_id], // @everyone role
			joined_at: new Date(),
			deaf: false,
			mute: false,
			pending: false,
			bio: "",
		};

		await Promise.all([
			Member.create({
				...member,
				roles: [Role.create({ id: guild_id })],
				// read_state: {},
				settings: {
					guild_id: null,
					mute_config: null,
					mute_scheduled_events: false,
					flags: 0,
					hide_muted_channels: false,
					notify_highlights: 0,
					channel_overrides: {},
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
					...new ReadyGuildDTO(guild).toJSON(),
					members: [...memberPreview, { ...member, user }],
					member_count: memberCount + 1,
					guild_hashes: {},
					guild_scheduled_events: [],
					joined_at: member.joined_at,
					presences: [],
					stage_instances: [],
					threads: [],
					embedded_activities: [],
					voice_states: guild.voice_states,
				},
				user_id,
			} as GuildCreateEvent),
		]);

		if (guild.system_channel_id) {
			// Send a welcome message
			const message = Message.create({
				type: 7,
				guild_id: guild.id,
				channel_id: guild.system_channel_id,
				author: user,
				timestamp: new Date(),
				reactions: [],
				attachments: [],
				embeds: [],
				sticker_items: [],
				edited_timestamp: undefined,
				mentions: [],
				mention_channels: [],
				mention_roles: [],
				mention_everyone: false,
			});
			await Promise.all([
				message.save(),
				emitEvent({
					event: "MESSAGE_CREATE",
					channel_id: message.channel_id,
					data: message,
				} as MessageCreateEvent),
			]);
		}
	}

	toPublicMember() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const member: any = {};
		PublicMemberProjection.forEach((x) => {
			member[x] = this[x];
		});

		if (member.roles) member.roles = member.roles.map((x: Role) => x.id);
		if (member.user) member.user = member.user.toPublicUser();

		return member as PublicMember;
	}
}

export interface ChannelOverride {
	message_notifications: number;
	mute_config: MuteConfig;
	muted: boolean;
	channel_id: string | null;
}

export interface UserGuildSettings {
	// channel_overrides: {
	// 	channel_id: string;
	// 	message_notifications: number;
	// 	mute_config: MuteConfig;
	// 	muted: boolean;
	// }[];

	channel_overrides: {
		[channel_id: string]: ChannelOverride;
	} | null;
	message_notifications: number;
	mobile_push: boolean;
	mute_config: MuteConfig | null;
	muted: boolean;
	suppress_everyone: boolean;
	suppress_roles: boolean;
	version: number;
	guild_id: string | null;
	flags: number;
	mute_scheduled_events: boolean;
	hide_muted_channels: boolean;
	notify_highlights: 0;
}

export const DefaultUserGuildSettings: UserGuildSettings = {
	channel_overrides: null,
	message_notifications: 1,
	flags: 0,
	hide_muted_channels: false,
	mobile_push: true,
	mute_config: null,
	mute_scheduled_events: false,
	muted: false,
	notify_highlights: 0,
	suppress_everyone: false,
	suppress_roles: false,
	version: 453, // ?
	guild_id: null,
};

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
	| "premium_since"
	| "avatar";

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
	"avatar",
];

export type PublicMember = Omit<Pick<Member, PublicMemberKeys>, "roles"> & {
	user: PublicUser;
	roles: string[]; // only role ids not objects
};
