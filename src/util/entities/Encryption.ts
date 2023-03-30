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
import { EntityCache } from "../cache";

@Entity("security_settings")
export class SecuritySettings extends EntityCache {
	@Column({ nullable: true })
	guild_id: string;

	@Column({ nullable: true })
	channel_id: string;

	@Column()
	encryption_permission_mask: number;

	@Column({ type: "simple-array" })
	allowed_algorithms: string[];

	@Column()
	current_algorithm: string;

	@Column({ nullable: true })
	used_since_message: string;
}
