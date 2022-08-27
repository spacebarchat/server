import "reflect-metadata";
import { Column, Entity, JoinColumn, ManyToOne, Relation, Unique } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity("notes")
@Unique(["owner", "target"])
export class Note extends BaseClass {
	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	owner: Relation<User>;

	@JoinColumn({ name: "target_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	target: Relation<User>;

	@Column()
	content: string;
}
