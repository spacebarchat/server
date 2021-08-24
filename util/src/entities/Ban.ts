import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("bans")
export class Ban extends BaseClass {
	@Column()
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@Column()
	executor_id: string;

	@JoinColumn({ name: "executor_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	executor: User;

	@Column()
	ip: string;

	@Column()
	reason?: string;
}
