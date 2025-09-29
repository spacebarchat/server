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
import { dbEngine } from "../util/Database";

export class RoleColors {
	primary_color: number;
	secondary_color: number | undefined; // only used for "holographic" and "gradient" styles
	tertiary_color?: number | undefined; // only used for "holographic" style

	toJSON(): RoleColors {
		return {
			...this,
			secondary_color: this.secondary_color ?? undefined,
			tertiary_color: this.tertiary_color ?? undefined,
		};
	}
}

@Entity({
	name: "roles",
	engine: dbEngine,
})
export class Role extends BaseClass {
	@Column()
	@RelationId((role: Role) => role.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild) => guild.roles, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column()
	color: number;

	@Column()
	hoist: boolean;

	@Column()
	managed: boolean;

	@Column()
	mentionable: boolean;

	@Column()
	name: string;

	@Column()
	permissions: string;

	@Column()
	position: number;

	@Column({ nullable: true })
	icon?: string;

	@Column({ nullable: true })
	unicode_emoji?: string;

	@Column({ type: "simple-json", nullable: true })
	tags?: {
		bot_id?: string;
		integration_id?: string;
		premium_subscriber?: boolean;
	};

	@Column({ default: 0 })
	flags: number;

	@Column({ nullable: false, type: "simple-json" })
	colors: RoleColors;

	toJSON(): Role {
		return {
			...this,
			tags: this.tags ?? undefined,
		};
	}
}
