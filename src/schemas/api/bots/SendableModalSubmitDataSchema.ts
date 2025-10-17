import { UploadAttachmentRequestSchema } from "@spacebar/schemas";
import { Attachment, Snowflake } from "@spacebar/util";

export interface SendableModalSubmitDataSchema {
	id: Snowflake;
	custom_id: string;
	// components: ModalSubmitComponentData[]; // TODO: do this
	attachments?: UploadAttachmentRequestSchema[];
}
