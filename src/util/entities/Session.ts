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

import { User } from "./User";
import { BaseClass } from "./BaseClass";
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { ClientStatus, Status } from "../interfaces/Status";
import { Activity } from "../interfaces/Activity";

//TODO we need to remove all sessions on server start because if the server crashes without closing websockets it won't delete them

@Entity({
	name: "sessions",
})
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

	@Column({ type: "simple-json", default: "[]" })
	activities: Activity[];

	@Column({ type: "simple-json", select: false })
	client_info: {
		client: string;
		os: string;
		version: number;
	};

	@Column({ type: "simple-json" })
	client_status: ClientStatus;

	@Column({ nullable: false, type: "varchar" })
	status: Status; //TODO enum
	getPublicStatus() {
		return this.status === "invisible" ? "offline" : this.status;
	}
}

export const PrivateSessionProjection: (keyof Session)[] = ["user_id", "session_id", "activities", "client_info", "status"];
