/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { ThreadMembersUpdateEvent } from "../interfaces";
import { emitEvent } from "../util";
import { BaseClassWithoutId } from "./BaseClass";
import { Channel } from "./Channel";
import { HTTPError } from "lambert-server";
import { Member } from "./Member";

// TODO: move
interface ThreadMemberMuteConfig {
    end_time?: Date;
    selected_time_window?: number;
}

// TODO: move
export enum ThreadMemberFlags {
    NONE = 0,
    HAS_INTERACTED = 1 << 0,
    ALL_MESSAGES = 1 << 1,
    ONLY_MENTIONS = 1 << 2,
    NO_MESSAGES = 1 << 3,
}

@Entity("thread_members")
@Index(["id", "member_idx"], { unique: true })
export class ThreadMember extends BaseClassWithoutId {
    @PrimaryGeneratedColumn()
    index: string;

    @Column()
    @RelationId((member: ThreadMember) => member.channel)
    id: string;

    @JoinColumn({ name: "id" })
    @ManyToOne(() => Channel, {
        onDelete: "CASCADE",
    })
    channel: Channel;

    @Column()
    @RelationId((member: ThreadMember) => member.member)
    member_idx: string;

    @JoinColumn({ name: "member_idx" })
    @ManyToOne(() => Member, {
        onDelete: "CASCADE",
    })
    member: Member;

    @Column()
    join_timestamp: Date;

    @Column()
    muted: boolean;

    @Column({ nullable: true, type: "simple-json" })
    mute_config?: ThreadMemberMuteConfig;

    @Column()
    flags: ThreadMemberFlags;

    static async IsInThreadOrFail(member_id: string, thread_id: string) {
        if (await ThreadMember.count({ where: { id: thread_id, member_idx: member_id } })) return true;
        throw new HTTPError("You are not member of this thread", 403);
    }

    static async removeFromThread(member_id: string, thread_id: string) {
        const channel = await Channel.findOneOrFail({ where: { id: thread_id } });
        if (
            !(await ThreadMember.count({
                where: {
                    id: thread_id,
                    member_idx: member_id,
                },
            }))
        )
            throw new HTTPError("You are not member of this thread", 403);
        // // use promise all to execute all promises at the same time -> save time
        // TODO: check for bugs
        if (channel.member_count) channel.member_count--;
        return Promise.all([
            ThreadMember.delete({
                id: thread_id,
                member_idx: member_id,
            }),
            // 	//Guild.decrement({ id: guild_id }, "member_count", -1),

            emitEvent({
                event: "THREAD_MEMBERS_UPDATE",
                data: {
                    guild_id: channel.guild_id,
                    id: channel.id,
                    member_count: channel.member_count,
                    removed_member_ids: [member_id],
                },
                channel_id: thread_id,
            } as ThreadMembersUpdateEvent),
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
