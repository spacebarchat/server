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

import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { Member } from "./Member";
import { User } from "./User";
import { dbEngine } from "../util/Database";

export const PublicInviteRelation = ["inviter", "guild", "channel"];

@Entity({
	name: "invites",
	engine: dbEngine,
})
export class Invite extends BaseClassWithoutId {
	@PrimaryIdColumn()
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

	isExpired() {
		if (this.max_age !== 0 && this.expires_at && this.expires_at < new Date()) return true;
		if (this.max_uses !== 0 && this.uses >= this.max_uses) return true;
		return false;
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
}
