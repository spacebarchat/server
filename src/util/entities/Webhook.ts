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
import { Application } from "./Application";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { User } from "./User";

export enum WebhookType {
	Incoming = 1,
	ChannelFollower = 2,
	Application = 3,
}

@Entity("webhooks")
export class Webhook extends BaseClass {
	@Column({ type: "int" })
	type: WebhookType;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	avatar?: string;

	@Column({ nullable: true })
	token?: string;

	@Column({ nullable: true })
	@RelationId((webhook: Webhook) => webhook.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column({ nullable: true })
	@RelationId((webhook: Webhook) => webhook.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
	})
	channel: Channel;

	@Column({ nullable: true })
	@RelationId((webhook: Webhook) => webhook.application)
	application_id: string;

	@JoinColumn({ name: "application_id" })
	@ManyToOne(() => Application, {
		onDelete: "CASCADE",
	})
	application: Application;

	@Column({ nullable: true })
	@RelationId((webhook: Webhook) => webhook.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column({ nullable: true })
	@RelationId((webhook: Webhook) => webhook.guild)
	source_guild_id: string;

	@JoinColumn({ name: "source_guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	source_guild: Guild;
}
