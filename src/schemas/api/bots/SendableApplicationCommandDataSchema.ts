import { Snowflake } from "@spacebar/util";
import { ApplicationCommandOption } from "../developers";
import { ApplicationCommandType } from "./ApplicationCommandSchema";

export interface SendableApplicationCommandDataSchema {
	id: Snowflake;
	type?: ApplicationCommandType;
	name: string;
	version: Snowflake;
	application_command?: object;
	options?: ApplicationCommandOption[];
	target_id?: Snowflake;
	attachments?: object[]; // idk the type
}
