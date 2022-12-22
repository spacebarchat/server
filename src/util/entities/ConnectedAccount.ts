import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

export interface PublicConnectedAccount
	extends Pick<ConnectedAccount, "name" | "type" | "verified"> {}

@Entity("connected_accounts")
export class ConnectedAccount extends BaseClass {
	@Column()
	external_id: string;

	@Column({ nullable: true })
	@RelationId((account: ConnectedAccount) => account.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column({ select: false })
	access_token: string;

	@Column({ select: false })
	friend_sync: boolean = false;

	@Column()
	name: string;

	@Column({ select: false })
	revoked: boolean = false;

	@Column({ select: false })
	show_activity: boolean = true;

	@Column()
	type: string;

	@Column()
	verified: boolean;

	@Column({ select: false })
	visibility: boolean = true;

	@Column({ type: "simple-array" })
	integrations: string[];

	@Column({ type: "simple-json", name: "metadata" })
	metadata_: any;

	@Column()
	metadata_visibility: boolean = true;

	@Column()
	two_way_link: boolean = false;
}
