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

import { Column, Entity } from "typeorm";
import { BaseClass } from "./BaseClass";
import {
	ApplicationCommandHandlerType,
	ApplicationCommandOption,
	ApplicationCommandIndexPermissions,
	ApplicationCommandType,
	Snowflake,
	ApplicationIntegrationType,
	InteractionContextType,
} from "@spacebar/schemas";

@Entity({
	name: "application_commands",
})
export class ApplicationCommand extends BaseClass {
	@Column({ default: ApplicationCommandType.CHAT_INPUT })
	type?: ApplicationCommandType;

	@Column()
	application_id: Snowflake;

	@Column({ nullable: true })
	guild_id?: Snowflake;

	@Column()
	name: string;

	@Column({ nullable: true, type: "simple-json" })
	name_localizations?: Record<string, string>;

	@Column()
	description: string;

	@Column({ nullable: true, type: "simple-json" })
	description_localizations?: Record<string, string>;

	@Column({ type: "simple-json", default: [] })
	options?: ApplicationCommandOption[];

	@Column({ nullable: true, type: String })
	default_member_permissions: string | null;

	/*
	 * @deprecated
	 */
	@Column({ default: true })
	dm_permission?: boolean;

	@Column({ nullable: true, type: "simple-json" })
	permissions?: ApplicationCommandIndexPermissions;

	@Column({ default: false })
	nsfw?: boolean;

	@Column({ type: "simple-json", default: [] })
	integration_types?: ApplicationIntegrationType[];

	@Column({ default: 0 })
	global_popularity_rank?: number;

	@Column({ type: "simple-json", default: [] })
	contexts?: InteractionContextType[];

	@Column({ default: 0 })
	version: Snowflake;

	@Column({ default: 0 })
	handler?: ApplicationCommandHandlerType;
}
