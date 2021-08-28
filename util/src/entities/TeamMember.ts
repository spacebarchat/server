import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

export enum TeamMemberState {
	INVITED = 1,
	ACCEPTED = 2,
}

@Entity("team_members")
export class TeamMember extends BaseClass {
	@Column({ type: "simple-enum", enum: TeamMemberState })
	membership_state: TeamMemberState;

	@Column({ type: "simple-array" })
	permissions: string[];

	@RelationId((member: TeamMember) => member.team)
	team_id: string;

	@JoinColumn({ name: "team_id" })
	@ManyToOne(() => require("./Team").Team, (team: import("./Team").Team) => team.id)
	team: import("./Team").Team;

	@RelationId((member: TeamMember) => member.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;
}
