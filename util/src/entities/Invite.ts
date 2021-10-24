import { Column, Entity, JoinColumn, ManyToOne, RelationId, PrimaryColumn } from "typeorm";
import { Member } from "./Member";
import { BaseClassWithoutId } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { User } from "./User";

export const PublicInviteRelation = ["inviter", "guild", "channel"];

@Entity("invites")
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

	@Column()
	expires_at: Date;

	@Column({ nullable: true })
	@RelationId((invite: Invite) => invite.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
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
	inviter_id: string;

	@JoinColumn({ name: "inviter_id" })
	@ManyToOne(() => User)
	inviter: User;

	@Column({ nullable: true })
	@RelationId((invite: Invite) => invite.target_user)
	target_user_id: string;

	@JoinColumn({ name: "target_user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	target_user?: string; // could be used for "User specific invites" https://github.com/fosscord/fosscord/issues/62

	@Column({ nullable: true })
	target_user_type?: number;

	@Column({ nullable: true })
	vanity_url?: boolean;

	static async joinGuild(user_id: string, code: string) {
		const invite = await Invite.findOneOrFail({ code });
		if (invite.uses++ >= invite.max_uses && invite.max_uses !== 0) await Invite.delete({ code });
		else await invite.save();

		await Member.addToGuild(user_id, invite.guild_id);
		return invite;
	}
}
