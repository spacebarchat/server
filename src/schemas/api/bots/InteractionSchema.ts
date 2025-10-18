import { ApplicationCommandOption, Snowflake, UploadAttachmentRequestSchema } from "@spacebar/schemas";
import { InteractionType } from "@spacebar/util";

export interface InteractionSchema {
	type: InteractionType;
	application_id: Snowflake;
	guild_id?: Snowflake;
	channel_id: Snowflake;
	message_id?: Snowflake;
	message_flags?: number;
	session_id?: string;
	data: InteractionData;
	files?: object[]; // idk the type
	nonce?: string;
	analytics_location?: string;
	section_name?: string;
	source?: string;
}

interface InteractionData {
	application_command: object;
	attachments: UploadAttachmentRequestSchema[];
	id: string;
	name: string;
	options: ApplicationCommandOption[];
	type: number;
	version: string;
}
