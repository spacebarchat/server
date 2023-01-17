import { Embed } from "@fosscord/util";

type Attachment = {
	id: string;
	filename: string;
};

export interface MessageCreateSchema {
	type?: number;
	content?: string;
	nonce?: string;
	channel_id?: string;
	tts?: boolean;
	flags?: string;
	embeds?: Embed[];
	embed?: Embed;
	// TODO: ^ embed is deprecated in favor of embeds (https://discord.com/developers/docs/resources/channel#message-object)
	allowed_mentions?: {
		parse?: string[];
		roles?: string[];
		users?: string[];
		replied_user?: boolean;
	};
	message_reference?: {
		message_id: string;
		channel_id: string;
		guild_id?: string;
		fail_if_not_exists?: boolean;
	};
	payload_json?: string;
	file?: { filename: string };
	/**
	TODO: we should create an interface for attachments
	TODO: OpenWAAO<-->attachment-style metadata conversion
	**/
	attachments?: Attachment[];
	sticker_ids?: string[];
}
