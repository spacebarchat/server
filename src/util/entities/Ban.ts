import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("bans")
export class Ban extends BaseClass {
	@Column({ nullable: true })
	@RelationId((ban: Ban) => ban.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column({ nullable: true })
	@RelationId((ban: Ban) => ban.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column({ nullable: true })
	@RelationId((ban: Ban) => ban.executor)
	executor_id: string;

	@JoinColumn({ name: "executor_id" })
	@ManyToOne(() => User)
	executor: User;

	@Column()
	ip: string;

	@Column({ nullable: true })
	reason?: string;
}
