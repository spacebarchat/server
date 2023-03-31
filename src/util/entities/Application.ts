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

import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Team } from "./Team";
import { User } from "./User";

@Entity("applications")
export class Application extends BaseClass {
	@Column()
	name: string;

	@Column({ nullable: true })
	icon?: string;

	@Column({ nullable: true })
	description: string;

	@Column({ nullable: true })
	summary: string = "";

	@Column({ type: "simple-json", nullable: true })
	type?: object; // TODO: this type is bad

	@Column()
	hook: boolean = true;

	@Column()
	bot_public?: boolean = true;

	@Column()
	bot_require_code_grant?: boolean = false;

	@Column()
	verify_key: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	owner: User;

	// TODO: enum this? https://discord.com/developers/docs/resources/application#application-object-application-flags
	@Column()
	flags: number = 0;

	@Column({ type: "simple-array", nullable: true })
	redirect_uris: string[] = [];

	@Column({ nullable: true })
	rpc_application_state: number = 0;

	@Column({ nullable: true })
	store_application_state: number = 1;

	@Column({ nullable: true })
	verification_state: number = 1;

	@Column({ nullable: true })
	interactions_endpoint_url?: string;

	@Column({ nullable: true })
	integration_public: boolean = true;

	@Column({ nullable: true })
	integration_require_code_grant: boolean = false;

	@Column({ nullable: true })
	discoverability_state: number = 1;

	@Column({ nullable: true })
	discovery_eligibility_flags: number = 2240;

	@JoinColumn({ name: "bot_user_id" })
	@OneToOne(() => User, { onDelete: "CASCADE" })
	bot?: User;

	@Column({ type: "simple-array", nullable: true })
	tags?: string[];

	@Column({ nullable: true })
	cover_image?: string; // the application's default rich presence invite cover image hash

	@Column({ type: "simple-json", nullable: true })
	install_params?: { scopes: string[]; permissions: string };

	@Column({ nullable: true })
	terms_of_service_url?: string;

	@Column({ nullable: true })
	privacy_policy_url?: string;

	//just for us

	//@Column({ type: "simple-array", nullable: true })
	//rpc_origins?: string[];

	//@JoinColumn({ name: "guild_id" })
	//@ManyToOne(() => Guild)
	//guild?: Guild; // if this application is a game sold, this field will be the guild to which it has been linked

	//@Column({ nullable: true })
	//primary_sku_id?: string; // if this application is a game sold, this field will be the id of the "Game SKU" that is created,

	//@Column({ nullable: true })
	//slug?: string; // if this application is a game sold, this field will be the URL slug that links to the store page

	@JoinColumn({ name: "team_id" })
	@ManyToOne(() => Team, {
		onDelete: "CASCADE",
		nullable: true,
	})
	team?: Team;
}

export interface ApplicationCommand {
	id: string;
	application_id: string;
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOption {
	type: ApplicationCommandOptionType;
	name: string;
	description: string;
	required?: boolean;
	choices?: ApplicationCommandOptionChoice[];
	options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOptionChoice {
	name: string;
	value: string | number;
}

export enum ApplicationCommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
}

export interface ApplicationCommandInteractionData {
	id: string;
	name: string;
	options?: ApplicationCommandInteractionDataOption[];
}

export interface ApplicationCommandInteractionDataOption {
	name: string;
	value?: unknown;
	options?: ApplicationCommandInteractionDataOption[];
}
