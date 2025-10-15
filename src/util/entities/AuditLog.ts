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
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import { AuditLogChange, AuditLogEvents } from "@spacebar/schemas";

@Entity({
	name: "audit_logs",
})
export class AuditLog extends BaseClass {
	@JoinColumn({ name: "target_id" })
	@ManyToOne(() => User)
	target?: User;

	@Column({ nullable: true })
	@RelationId((auditlog: AuditLog) => auditlog.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@Column({ type: "int" })
	action_type: AuditLogEvents;

	@Column({ type: "simple-json", nullable: true })
	options?: {
		delete_member_days?: string;
		members_removed?: string;
		channel_id?: string;
		messaged_id?: string;
		count?: string;
		id?: string;
		type?: string;
		role_name?: string;
	};

	@Column()
	@Column({ type: "simple-json" })
	changes: AuditLogChange[];

	@Column({ nullable: true })
	reason?: string;
}

