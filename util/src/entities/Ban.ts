import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("bans")
export class Ban extends BaseClass {
	@RelationId((ban: Ban) => ban.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@RelationId((ban: Ban) => ban.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@RelationId((ban: Ban) => ban.executor)
	executor_id: string;

	@JoinColumn({ name: "executor_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	executor: User;

	@Column()
	ip: string;

	@Column({ nullable: true })
	reason?: string;
}
