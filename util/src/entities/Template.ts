import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("templates")
export class Template extends BaseClass {
	@Column()
	code: string;

	@Column()
	name: string;

	@Column()
	description?: string;

	@Column()
	usage_count?: number;

	@JoinColumn({ name: "creator_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	creator: User;

	@Column()
	created_at: Date;

	@Column()
	updated_at: Date;

	@JoinColumn({ name: "source_guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	source_guild: Guild;
}
