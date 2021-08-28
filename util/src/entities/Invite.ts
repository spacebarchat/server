import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("invites")
export class Invite extends BaseClass {
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

	@RelationId((invite: Invite) => invite.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@RelationId((invite: Invite) => invite.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	channel: Channel;

	@RelationId((invite: Invite) => invite.inviter)
	inviter_id: string;

	@JoinColumn({ name: "inviter_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	inviter: User;

	@RelationId((invite: Invite) => invite.target_user)
	target_user_id: string;

	@JoinColumn({ name: "target_user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	target_user?: string; // could be used for "User specific invites" https://github.com/fosscord/fosscord/issues/62

	@Column({ nullable: true })
	target_user_type?: number;
}
