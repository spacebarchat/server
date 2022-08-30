import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("templates")
export class Template extends BaseClass {
	@Column({ unique: true })
	code: string;

	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ nullable: true })
	usage_count?: number;

	@Column({ nullable: true })
	@RelationId((template: Template) => template.creator)
	creator_id: string;

	@JoinColumn({ name: "creator_id" })
	@ManyToOne(() => User)
	creator: User;

	@Column()
	created_at: Date;

	@Column()
	updated_at: Date;

	@Column({ nullable: true })
	@RelationId((template: Template) => template.source_guild)
	source_guild_id: string;

	@JoinColumn({ name: "source_guild_id" })
	@ManyToOne(() => Guild)
	source_guild: Guild;

	@Column({ type: "simple-json" })
	serialized_source_guild: Guild;
}
