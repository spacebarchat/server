import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
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

	@Column("simple-array")
	permissions: string[];

	@Column()
	team_id: string;

	@JoinColumn({ name: "team_id" })
	@ManyToOne(() => require("./Team").Team, (team: import("./Team").Team) => team.id)
	team: import("./Team").Team;

	@Column()
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;
}
