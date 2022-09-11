import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { ThreadMembersUpdateEvent } from "../interfaces";
import { emitEvent, HTTPError } from "../util";
import { BaseClassWithoutId } from "./BaseClass";
import { Channel } from "./Channel";
import { User } from "./User";

@Entity("thread_members")
@Index(["id", "user_id"], { unique: true })
export class ThreadMember extends BaseClassWithoutId {
	@PrimaryGeneratedColumn()
	index: string;

	@Column()
	@RelationId((member: ThreadMember) => member.channel)
	id: string;

	@JoinColumn({ name: "id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE"
	})
	channel: Channel;

	@Column()
	@RelationId((member: ThreadMember) => member.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE"
	})
	user: User;

	@Column()
	join_timestamp: Date;

	@Column()
	muted: boolean;

	// @Column()
	// mute_config: any = null; // TODO: unknown what other values this could have

	@Column()
	flags: number;

	static async IsInThreadOrFail(user_id: string, thread_id: string) {
		if (await ThreadMember.count({ where: { id: thread_id, user_id } })) return true;
		throw new HTTPError("You are not member of this thread", 403);
	}

	static async removeFromThread(user_id: string, thread_id: string) {
		const channel = await Channel.findOneOrFail({ where: { id: thread_id } });
		if (
			!(await ThreadMember.count({
				where: {
					id: thread_id,
					user_id
				}
			}))
		)
			throw new HTTPError("You are not member of this thread", 403);
		// // use promise all to execute all promises at the same time -> save time
		// TODO: check for bugs
		if (channel.member_count) channel.member_count--;
		return Promise.all([
			ThreadMember.delete({
				id: thread_id,
				user_id
			}),
			// 	//Guild.decrement({ id: guild_id }, "member_count", -1),

			emitEvent({
				event: "THREAD_MEMBERS_UPDATE",
				data: {
					guild_id: channel.guild_id,
					id: channel.id,
					member_count: channel.member_count,
					removed_member_ids: [user_id]
				},
				channel_id: thread_id
			} as ThreadMembersUpdateEvent)
		]);
	}

	// static async addRole(user_id: string, guild_id: string, role_id: string) {
	// 	const [member, role] = await Promise.all([
	// 		// @ts-ignore
	// 		Member.findOneOrFail({
	// 			where: { id: user_id, guild_id },
	// 			relations: ["user", "roles"], // we don't want to load  the role objects just the ids
	// 			select: ["index"]
	// 		}),
	// 		Role.findOneOrFail({ where: { id: role_id, guild_id }, select: ["id"] })
	// 	]);
	// 	member.roles.push(OrmUtils.mergeDeep(new Role(), { id: role_id }));

	// 	await Promise.all([
	// 		member.save(),
	// 		emitEvent({
	// 			event: "GUILD_MEMBER_UPDATE",
	// 			data: {
	// 				guild_id,
	// 				user: member.user,
	// 				roles: member.roles.map((x) => x.id)
	// 			},
	// 			guild_id
	// 		} as GuildMemberUpdateEvent)
	// 	]);
	// }

	// static async removeRole(user_id: string, guild_id: string, role_id: string) {
	// 	const [member] = await Promise.all([
	// 		// @ts-ignore
	// 		Member.findOneOrFail({
	// 			where: { id: user_id, guild_id },
	// 			relations: ["user", "roles"], // we don't want to load  the role objects just the ids
	// 			select: ["index"]
	// 		}),
	// 		await Role.findOneOrFail({ where: { id: role_id, guild_id } })
	// 	]);
	// 	member.roles = member.roles.filter((x) => x.id == role_id);

	// 	await Promise.all([
	// 		member.save(),
	// 		emitEvent({
	// 			event: "GUILD_MEMBER_UPDATE",
	// 			data: {
	// 				guild_id,
	// 				user: member.user,
	// 				roles: member.roles.map((x) => x.id)
	// 			},
	// 			guild_id
	// 		} as GuildMemberUpdateEvent)
	// 	]);
	// }

	// static async changeNickname(user_id: string, guild_id: string, nickname: string) {
	// 	const member = await Member.findOneOrFail({
	// 		where: {
	// 			id: user_id,
	// 			guild_id
	// 		},
	// 		relations: ["user"]
	// 	});
	// 	member.nick = nickname;

	// 	await Promise.all([
	// 		member.save(),

	// 		emitEvent({
	// 			event: "GUILD_MEMBER_UPDATE",
	// 			data: {
	// 				guild_id,
	// 				user: member.user,
	// 				nick: nickname
	// 			},
	// 			guild_id
	// 		} as GuildMemberUpdateEvent)
	// 	]);
	// }
}
