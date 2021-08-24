import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { TeamMember } from "./TeamMember";
import { User } from "./User";

@Entity("teams")
export class Team extends BaseClass {
	@Column()
	icon?: string;

	@Column("simple-array")
	member_ids: string[];

	@JoinColumn({ name: "member_ids" })
	@ManyToMany(() => TeamMember, (member: TeamMember) => member.id)
	members: TeamMember[];

	@Column()
	name: string;

	@Column()
	owner_user_id: string;

	@JoinColumn({ name: "owner_user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	owner_user: User;
}
