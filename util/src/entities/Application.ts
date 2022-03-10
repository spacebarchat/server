import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { ClientApplicationAssetTypes } from "../util";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Team } from "./Team";
import { User } from "./User";

@Entity("applications")
export class Application extends BaseClass {
	@Column()
	name: string;

	@Column({ nullable: true })
	icon?: string;

	@Column()
	description: string;

	@Column({ type: "simple-array", nullable: true })
	rpc_origins?: string[];

	@Column()
	bot_public: boolean;

	@Column()
	bot_require_code_grant: boolean;

	@Column({ nullable: true })
	terms_of_service_url?: string;

	@Column({ nullable: true })
	privacy_policy_url?: string;

	@Column({ nullable: true })
	@RelationId((application: Application) => application.bot)
	bot_id: string;

	@JoinColumn({ name: "bot_id" })
	@ManyToOne(() => User)
	bot?: User;

	@Column()
	@RelationId((application: Application) => application.owner)
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User)
	owner?: User;

	@Column({ nullable: true })
	summary?: string;

	@Column()
	verify_key: string;

	@Column({ nullable: true })
	@RelationId((application: Application) => application.team)
	team_id: string;

	@JoinColumn({ name: "team_id" })
	@ManyToOne(() => Team, {
		onDelete: "CASCADE",
	})
	team?: Team;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild)
	guild: Guild; // if this application is a game sold, this field will be the guild to which it has been linked

	@Column({ nullable: true })
	primary_sku_id?: string; // if this application is a game sold, this field will be the id of the "Game SKU" that is created,

	@Column({ nullable: true })
	slug?: string; // if this application is a game sold, this field will be the URL slug that links to the store page

	@Column({ nullable: true })
	cover_image?: string; // the application's default rich presence invite cover image hash

	@Column()
	flags: string; // the application's public flags

	@Column({ nullable: true })
	type?: string;

	@Column()
	hook: boolean;

	@Column()
	store_application_state: number;

	@Column()
	rpc_application_state: number;

	@Column({ type: "simple-array" })
	redirect_uris: string[];

	@Column()
	verification_state: number;

	@Column({ nullable: true })
	interactions_endpoint_url: string;

	@Column()
	integration_public: boolean;

	@Column()
	integration_require_code_grant: boolean;

	@Column()
	discoverability_state: number;

	@Column()
	discovery_eligibility_flags: number;

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
	value?: any;
	options?: ApplicationCommandInteractionDataOption[];
}
