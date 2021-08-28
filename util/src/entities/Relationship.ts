import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
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
	@ManyToOne(() => User, (user: User) => user.relationships)
	user: User;

	@Column({ nullable: true })
	nickname?: string;

	@Column({ type: "simple-enum", enum: RelationshipType })
	type: RelationshipType;
}
