/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { ConnectedAccountTokenData } from "../interfaces";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity({
	name: "connected_accounts",
})
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
	friend_sync?: boolean = false;

	@Column()
	name: string;

	@Column({ select: false })
	revoked?: boolean = false;

	@Column({ select: false })
	show_activity?: number = 0;

	@Column()
	type: string;

	@Column()
	verified?: boolean = true;

	@Column({ select: false })
	visibility?: number = 0;

	@Column({ type: "simple-array" })
	integrations?: string[] = [];

	@Column({ type: "simple-json", name: "metadata", nullable: true })
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	metadata_?: any;

	@Column()
	metadata_visibility?: number = 0;

	@Column()
	two_way_link?: boolean = false;

	@Column({ select: false, nullable: true, type: "simple-json" })
	token_data?: ConnectedAccountTokenData | null;

	async revoke() {
		this.revoked = true;
		this.token_data = null;
		await this.save();
	}
}
