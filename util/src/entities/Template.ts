import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("templates")
export class Template extends BaseClass {
	@PrimaryColumn()
	code: string;

	@Column()
	name: string;

	@Column()
	description?: string;

	@Column()
	usage_count?: number;

	@RelationId((template: Template) => template.creator)
	creator_id: string;

	@JoinColumn({ name: "creator_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	creator: User;

	@Column()
	created_at: Date;

	@Column()
	updated_at: Date;

	@RelationId((template: Template) => template.source_guild)
	source_guild_id: string;

	@JoinColumn({ name: "source_guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	source_guild: Guild;

	@Column("simple-json")
	serialized_source_guild: Guild;
}
