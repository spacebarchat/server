import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("invites")
export class Invite extends BaseClass {
	@Column()
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

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@Column()
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	channel: Channel;

	@Column()
	inviter_id: string;

	@JoinColumn({ name: "inviter_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	inviter: User;

	@Column()
	target_usser_id: string;

	@JoinColumn({ name: "target_user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	target_user?: string; // could be used for "User specific invites" https://github.com/fosscord/fosscord/issues/62

	@Column()
	target_user_type?: number;
}
