import { Column, Entity, JoinColumn, ManyToOne, OneToOne, RelationId } from "typeorm";
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
	
	@Column({ nullable: true })
	description: string;
	
	@Column({ nullable: true })
	summary: string = "";
	
	@Column({ type: "simple-json", nullable: true })
	type?: any;
	
	@Column()
	hook: boolean = true;
	
	@Column()
	bot_public?: boolean = true;
	
	@Column()
	bot_require_code_grant?: boolean = false;
	
	@Column()
	verify_key: string;
	
	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User)
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
	@OneToOne(() => User)
	bot?: User;
	
	@Column({ type: "simple-array", nullable: true })
	tags?: string[];
	
	@Column({ nullable: true })
	cover_image?: string; // the application's default rich presence invite cover image hash
	
	@Column({ type: "simple-json", nullable: true })
	install_params?: {scopes: string[], permissions: string};

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
	value?: any;
	options?: ApplicationCommandInteractionDataOption[];
}
