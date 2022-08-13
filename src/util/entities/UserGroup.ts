import "reflect-metadata";
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity("groups")
export class UserGroup extends BaseClass {
	@Column()
	color: number;

	@Column()
	hoist: boolean;

	@JoinColumn({ name: "controller", referencedColumnName: "id" })
	@ManyToOne(() => User)
	controller?: User;

	@Column()
	mentionable_by?: string;

	@Column()
	name: string;

	@Column()
	rights: string;

	@Column({ nullable: true })
	icon: string;

	@Column({ nullable: true })
	parent?: string;

	@Column({ type: "simple-array", nullable: true })
	associciations: string[];
}
