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

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Team } from "./Team";
import { User } from "./User";
import { Guild } from "./Guild";

@Entity({
	name: "instance_bans",
})
export class InstanceBan extends BaseClass {
	@Column({ type: "bigint" })
	@CreateDateColumn()
	created_at: Date = new Date();

	@Column()
	reason: string;

	@Column({ nullable: true })
	user_id?: string;

	@Column({ nullable: true })
	fingerprint?: string;

	@Column({ nullable: true })
	ip_address?: string;

	// chain of trust type tracking

	@Column({ default: false })
	is_from_other_instance_ban: boolean = false;

	@Column({ nullable: true })
	@RelationId((instance_ban: InstanceBan) => instance_ban.origin_instance_ban)
	origin_instance_ban_id?: string;

	@JoinColumn({ name: "origin_instance_ban_id" })
	@OneToOne(() => InstanceBan, { nullable: true, onDelete: "SET NULL" })
	origin_instance_ban?: InstanceBan;
}
