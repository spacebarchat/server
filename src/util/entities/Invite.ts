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

import { Column, Entity, FindOptionsWhere, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { BaseClassWithoutId } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { Member } from "./Member";
import { User } from "./User";
import { buildInviteReuseCriteria, findReusableInviteCandidate, InviteCreateContext, NormalizedInviteCreateOptions, shouldReuseInviteForCreate } from "../util/InviteCreate";

export const PublicInviteRelation = ["inviter", "guild", "channel"];

@Entity({
    name: "invites",
})
export class Invite extends BaseClassWithoutId {
    @PrimaryColumn()
    code: string;

    @Column()
    temporary: boolean;

    @Column()
    uses: number;

    @Column()
    max_uses: number;

    @Column()
    max_age: number;

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    expires_at?: Date;

    @Column({ nullable: true })
    @RelationId((invite: Invite) => invite.guild)
    guild_id: string;

    @JoinColumn({ name: "guild_id" })
    @ManyToOne(() => Guild, (guild) => guild.invites, {
        onDelete: "CASCADE",
    })
    guild: Guild;

    @Column({ nullable: true })
    @RelationId((invite: Invite) => invite.channel)
    channel_id: string;

    @JoinColumn({ name: "channel_id" })
    @ManyToOne(() => Channel, {
        onDelete: "CASCADE",
    })
    channel: Channel;

    @Column({ nullable: true })
    @RelationId((invite: Invite) => invite.inviter)
    inviter_id?: string;

    @JoinColumn({ name: "inviter_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    inviter: User;

    @Column({ nullable: true })
    @RelationId((invite: Invite) => invite.target_user)
    target_user_id: string;

    @JoinColumn({ name: "target_user_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    target_user?: string; // could be used for "User specific invites" https://github.com/spacebarchat/server/issues/326

    @Column({ nullable: true })
    target_user_type?: number;

    @Column({ nullable: true })
    vanity_url?: boolean;

    @Column()
    flags: number;

    isExpired(now = new Date()) {
        if (this.max_age !== 0 && this.expires_at && this.expires_at < now) return true;
        if (this.max_uses !== 0 && this.uses >= this.max_uses) return true;
        return false;
    }
    toPublicJSON() {
        return {
            ...this,
            inviter: this.inviter.toPublicUser(),
        };
    }

    static async joinGuild(user_id: string, code: string) {
        const invite = await Invite.findOneOrFail({ where: { code } });
        if (invite.isExpired()) {
            await Invite.delete({ code });
            throw new Error("Invite is expired");
        }
        if (invite.uses++ >= invite.max_uses && invite.max_uses !== 0) await Invite.delete({ code });
        else await invite.save();

        await Member.addToGuild(user_id, invite.guild_id);
        return invite;
    }

    static createForChannel(code: string, context: InviteCreateContext, options: NormalizedInviteCreateOptions) {
        const invite = new Invite();
        invite.code = code;
        invite.temporary = options.temporary;
        invite.uses = 0;
        invite.max_uses = options.max_uses;
        invite.max_age = options.max_age;
        invite.expires_at = options.expires_at;
        invite.created_at = options.created_at;
        invite.guild_id = context.guild_id;
        invite.channel_id = context.channel_id;
        invite.inviter_id = context.inviter_id;
        invite.flags = options.flags;
        if (options.target_user_id !== undefined) invite.target_user_id = options.target_user_id;
        invite.target_user_type = options.target_user_type;

        return invite;
    }

    static async findReusableForCreate(context: InviteCreateContext, options: NormalizedInviteCreateOptions, now = new Date()) {
        if (!shouldReuseInviteForCreate(options)) return undefined;

        const invites = await Invite.find({
            where: buildInviteReuseCriteria(context, options) as FindOptionsWhere<Invite>,
            order: {
                created_at: "ASC",
            },
        });

        return findReusableInviteCandidate(invites, now);
    }
}
