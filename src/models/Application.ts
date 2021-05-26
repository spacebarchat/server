import { Team } from "./Team";

export interface Application {
	id: string;
	name: string;
	icon: string | null;
	description: string;
	rpc_origins: string[] | null;
	bot_public: boolean;
	bot_require_code_grant: boolean;
	terms_of_service_url: string | null;
	privacy_policy_url: string | null;
	owner_id: string;
	summary: string | null;
	verify_key: string;
	team: Team | null;
	guild_id: string; // if this application is a game sold on Discord, this field will be the guild to which it has been linked
	primary_sku_id: string | null; // if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists
	slug: string | null; // if this application is a game sold on Discord, this field will be the URL slug that links to the store page
	cover_image: string | null; // the application's default rich presence invite cover image hash
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
