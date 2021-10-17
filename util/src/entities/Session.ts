import { User } from "./User";
import { BaseClass } from "./BaseClass";
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { Status } from "../interfaces/Status";
import { Activity } from "../interfaces/Activity";

//TODO we need to remove all sessions on server start because if the server crashes without closing websockets it won't delete them

@Entity("sessions")
export class Session extends BaseClass {
	@Column({ nullable: true })
	@RelationId((session: Session) => session.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	//TODO check, should be 32 char long hex string
	@Column({ nullable: false, select: false })
	session_id: string;

	@Column({ type: "simple-json", nullable: true })
	activities: Activity[];

	// TODO client_status
	@Column({ type: "simple-json", select: false })
	client_info: {
		client: string;
		os: string;
		version: number;
	};

	@Column({ nullable: false, type: "varchar" })
	status: Status; //TODO enum
}

export const PrivateSessionProjection: (keyof Session)[] = [
	"user_id",
	"session_id",
	"activities",
	"client_info",
	"status",
];
