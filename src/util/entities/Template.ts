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
import { Guild } from "./Guild";
import { User } from "./User";

@Entity({
	name: "templates",
})
export class Template extends BaseClass {
	@Column({ unique: true })
	code: string;

	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ nullable: true })
	usage_count?: number;

	@Column({ nullable: true })
	@RelationId((template: Template) => template.creator)
	creator_id: string;

	@JoinColumn({ name: "creator_id" })
	@ManyToOne(() => User)
	creator: User;

	@Column()
	created_at: Date;

	@Column()
	updated_at: Date;

	@Column({ nullable: true })
	@RelationId((template: Template) => template.source_guild)
	source_guild_id: string;

	@JoinColumn({ name: "source_guild_id" })
	@ManyToOne(() => Guild, { onDelete: "CASCADE" })
	source_guild: Guild;

	@Column({ type: "simple-json" })
	serialized_source_guild: Guild;
}
