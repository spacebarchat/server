import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity("notes")
@Unique(["owner", "target"])
export class Note extends BaseClass {
	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	owner: User;

	@JoinColumn({ name: "target_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	target: User;

	@Column()
	content: string;
}