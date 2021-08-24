import { Column, Entity } from "typeorm";
import { BaseClass } from "./BaseClass";

@Entity("connected_accounts")
export class ConnectedAccount extends BaseClass {
	@Column()
	access_token: string;

	@Column()
	friend_sync: boolean;

	@Column()
	name: string;

	@Column()
	revoked: boolean;

	@Column()
	show_activity: boolean;

	@Column()
	type: string;

	@Column()
	verifie: boolean;

	@Column()
	visibility: number;
}
