import "reflect-metadata";
import { Column, Entity, JoinColumn, ManyToOne, Relation, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Team } from "./Team";
import { User } from "./User";

export enum TeamMemberState {
	INVITED = 1,
	ACCEPTED = 2
}

@Entity("team_members")
export class TeamMember extends BaseClass {
	@Column({ type: "int" })
	membership_state: TeamMemberState;

	@Column({ type: "simple-array" })
	permissions: string[];

	@Column({ nullable: true })
	@RelationId((member: TeamMember) => member.team)
	team_id: string;

	@JoinColumn({ name: "team_id" })
	@ManyToOne(() => Team, (team: any) => team.members, {
		onDelete: "CASCADE"
	})
	team: Relation<Team>;

	@Column({ nullable: true })
	@RelationId((member: TeamMember) => member.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE"
	})
	user: Relation<User>;
}
