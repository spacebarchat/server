import { Attachment, Embed, MessageCreateSchema, MessageType } from "@fosscord/util*";

export interface MessageOptions extends MessageCreateSchema {
    id?: string;
    type?: MessageType;
    pinned?: boolean;
    author_id?: string;
    webhook_id?: string;
    application_id?: string;
    embeds?: Embed[];
    channel_id?: string;
    attachments?: Attachment[];
    edited_timestamp?: Date;
    timestamp?: Date;
}