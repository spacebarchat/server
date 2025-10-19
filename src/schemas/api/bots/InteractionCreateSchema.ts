import { PublicMember, PublicUser, Snowflake } from "@spacebar/schemas";
import { Channel, InteractionType, Message } from "@spacebar/util";

export interface InteractionCreateSchema {
	version: number; // TODO: types?
	id: Snowflake;
	application_id: Snowflake;
	type: InteractionType;
	token: string;
	data?: object; // TODO: types?
	guild?: InteractionGuild;
	guild_id?: Snowflake;
	guild_locale?: string;
	channel?: Channel; // TODO: is this right?
	channel_id?: Snowflake;
	member?: PublicMember; // TODO: is this right?
	user?: PublicUser; // TODO: is this right?
	locale?: string;
	message?: Message; // TODO: is this right?
	app_permissions: string;
	entitlements?: object[]; // TODO: types?
	entitlement_sku_ids?: Snowflake[]; // DEPRECATED
	authorizing_integration_owners?: Record<number, Snowflake>; // TODO: types?
	context?: number;
	attachment_size_limit: number;
}

interface InteractionGuild {
	id: Snowflake;
	features: string[];
	locale: string;
}
