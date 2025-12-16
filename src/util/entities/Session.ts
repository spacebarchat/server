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
import { BaseClass, BaseClassWithoutId } from "./BaseClass";
import { ClientSession, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { ClientStatus, Status } from "../interfaces/Status";
import { Activity } from "../interfaces/Activity";
import crypto from "crypto";
import { randomString, randomUpperString } from "@spacebar/api*";

//TODO we need to remove all sessions on server start because if the server crashes without closing websockets it won't delete them

@Entity({
	name: "sessions",
})
export class Session extends BaseClassWithoutId {
	@PrimaryColumn({ nullable: false })
	session_id: string = randomUpperString();

	@Column()
	@RelationId((session: Session) => session.user)
	@Index({})
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column({ type: "simple-json", default: "[]" })
	activities: Activity[];

	@Column({ type: "simple-json", select: false })
	client_info: {
		client: string;
		os: string;
		version: number;
		location: string;
	};

	@Column({ type: "simple-json" })
	client_status: ClientStatus;

	@Column({ nullable: false, type: String })
	status: Status; //TODO enum

	@Column({ default: false })
	is_admin_session: boolean;

	@CreateDateColumn({ type: Date })
	created_at: Date;

	@Column({ default: 0, type: Date })
	last_seen: Date;

	@Column({ default: "127.0.0.1", type: String })
	last_seen_ip: string;

	@Column({ nullable: true, type: String })
	last_seen_location?: string;

	getPublicStatus() {
		return this.status === "invisible" ? "offline" : this.status;
	}

	getDiscordDeviceInfo() {
		return {
			id_hash: crypto.createHash("sha256").update(this.session_id).digest("hex"),
			approx_last_used_time: this.last_seen.toISOString(),
			client_info: {
				os: this.client_info.os,
				client: this.client_info.client,
				location: this.last_seen_location
			},
		};
	}
}

export const PrivateSessionProjection: (keyof Session)[] = ["user_id", "session_id", "activities", "client_info", "status"];
