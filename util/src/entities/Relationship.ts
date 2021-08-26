import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

export enum RelationshipType {
	outgoing = 4,
	incoming = 3,
	blocked = 2,
	friends = 1,
}

@Entity("relationships")
export class Relationship extends BaseClass {
	@RelationId((relationship: Relationship) => relationship.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@Column()
	nickname?: string;

	@Column({ type: "simple-enum", enum: RelationshipType })
	type: RelationshipType;
}
