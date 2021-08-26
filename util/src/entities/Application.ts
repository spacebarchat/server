import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Team } from "./Team";

@Entity("applications")
export class Application extends BaseClass {
	@Column()
	name: string;

	@Column()
	icon?: string;

	@Column()
	description: string;

	@Column("simple-array")
	rpc_origins?: string[];

	@Column()
	bot_public: boolean;

	@Column()
	bot_require_code_grant: boolean;

	@Column()
	terms_of_service_url?: string;

	@Column()
	privacy_policy_url?: string;

	@Column()
	owner_id: string;

	@Column()
	summary?: string;

	@Column()
	verify_key: string;

	@RelationId((application: Application) => application.team)
	team_id: string;

	@JoinColumn({ name: "team_id" })
	@ManyToOne(() => Team, (team: Team) => team.id)
	team?: Team;

	@RelationId((application: Application) => application.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild; // if this application is a game sold, this field will be the guild to which it has been linked

	@Column()
	primary_sku_id?: string; // if this application is a game sold, this field will be the id of the "Game SKU" that is created,

	@Column()
	slug?: string; // if this application is a game sold, this field will be the URL slug that links to the store page

	@Column()
	cover_image?: string; // the application's default rich presence invite cover image hash

	@Column()
	flags: number; // the application's public flags
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
