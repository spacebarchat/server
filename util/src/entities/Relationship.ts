import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

export enum RelationshipType {
	outgoing = 4,
	incoming = 3,
	blocked = 2,
	friends = 1,
}

@Entity("relationships")
@Index(["from_id", "to_id"], { unique: true })
export class Relationship extends BaseClass {
	@Column({})
	@RelationId((relationship: Relationship) => relationship.from)
	from_id: string;

	@JoinColumn({ name: "from_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	from: User;

	@Column({})
	@RelationId((relationship: Relationship) => relationship.to)
	to_id: string;

	@JoinColumn({ name: "to_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	to: User;

	@Column({ nullable: true })
	nickname?: string;

	@Column({ type: "int" })
	type: RelationshipType;

	toPublicRelationship() {
		return {
			id: this.to?.id || this.to_id,
			type: this.type,
			nickname: this.nickname,
			user: this.to?.toPublicUser(),
		};
	}
}
