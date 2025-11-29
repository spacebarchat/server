import {
	ApplicationCommandHandlerType,
	ApplicationCommandOption,
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	StringStringDictionary,
} from "@spacebar/schemas";

export interface ApplicationCommandCreateSchema {
	type?: ApplicationCommandType;
	name: string;
	name_localizations?: StringStringDictionary;
	description?: string;
	description_localizations?: StringStringDictionary;
	options?: ApplicationCommandOption[];
	default_member_permissions?: string;
	/*
	 * @deprecated
	 */
	dm_permission?: boolean;
	nsfw?: boolean;
	integration_types?: ApplicationIntegrationType[];
	contexts?: InteractionContextType[];
	handler?: ApplicationCommandHandlerType;
}

export type BulkApplicationCommandCreateSchema = ApplicationCommandCreateSchema[];
