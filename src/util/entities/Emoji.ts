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
import { User } from ".";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { dbEngine } from "../util/Database";

@Entity({
	name: "emojis",
	engine: dbEngine,
})
export class Emoji extends BaseClass {
	@Column()
	animated: boolean;

	@Column()
	available: boolean; // whether this emoji can be used, may be false due to various reasons

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild) => guild.emojis, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column({ nullable: true })
	@RelationId((emoji: Emoji) => emoji.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User)
	user: User;

	@Column()
	managed: boolean;

	@Column()
	name: string;

	@Column()
	require_colons: boolean;

	@Column({ type: "simple-array" })
	roles: string[]; // roles this emoji is whitelisted to (new discord feature?)

	@Column({ type: "simple-array", nullable: true })
	groups: string[]; // user groups this emoji is whitelisted to (Spacebar extension)
}
