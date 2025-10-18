/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2024 Spacebar and Spacebar Contributors

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

import { BaseClass } from "./BaseClass";
import { Entity, JoinColumn, ManyToOne, Column } from "typeorm";
import { User } from "./User";
import { AutomodAction, AutomodRuleActionType, AutomodRuleEventType, AutomodRuleTriggerMetadata, AutomodRuleTriggerType } from "@spacebar/schemas";

@Entity({
	name: "automod_rules",
})
export class AutomodRule extends BaseClass {
	@JoinColumn({ name: "creator_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	creator: User;

	@Column()
	enabled: boolean;

	@Column()
	event_type: AutomodRuleEventType;

	@Column({ type: "simple-array" })
	exempt_channels: string[];

	@Column({ type: "simple-array" })
	exempt_roles: string[];

	@Column()
	guild_id: string;

	@Column()
	name: string;

	@Column()
	position: number;

	@Column()
	trigger_type: AutomodRuleTriggerType;

	@Column({
		type: "simple-json",
		nullable: true,
	})
	trigger_metadata?: // this is null for "Block suspected spam content"
	| AutomodRuleTriggerMetadata;

	@Column({
		type: "simple-json",
	})
	actions: AutomodAction[];
}
