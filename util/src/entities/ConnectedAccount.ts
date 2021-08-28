import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity("connected_accounts")
export class ConnectedAccount extends BaseClass {
	@RelationId((account: ConnectedAccount) => account.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.connected_accounts)
	user: User;

	@Column({ select: false })
	access_token: string;

	@Column({ select: false })
	friend_sync: boolean;

	@Column()
	name: string;

	@Column({ select: false })
	revoked: boolean;

	@Column({ select: false })
	show_activity: boolean;

	@Column()
	type: string;

	@Column()
	verifie: boolean;

	@Column({ select: false })
	visibility: number;
}
