import { Snowflake } from "@spacebar/util";
import { MessageComponentType } from "../messages";
import { ApplicationCommandType } from "./ApplicationCommandSchema";

export interface SendableMessageComponentDataSchema {
	component_type?: MessageComponentType;
	type?: ApplicationCommandType;
	custom_id: string;
	values?: Snowflake[] | string[];
}
