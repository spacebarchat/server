import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";

@Entity("roles")
export class Role extends BaseClass {
	@Column({ nullable: true })
	@RelationId((role: Role) => role.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column()
	color: number;

	@Column()
	hoist: boolean;

	@Column()
	managed: boolean;

	@Column()
	mentionable: boolean;

	@Column()
	name: string;

	@Column()
	permissions: string;

	@Column()
	position: number;

	@Column({ type: "simple-json", nullable: true })
	tags?: {
		bot_id?: string;
		integration_id?: string;
		premium_subscriber?: boolean;
	};
}
