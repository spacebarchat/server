import { Attachment, Embed, MessageType, PublicUser, Role } from "../../entities";

export interface GuildMessagesSearchMessage {
	id: string;
	type: MessageType;
	content?: string;
	channel_id: string;
	author: PublicUser;
	attachments: Attachment[];
	embeds: Embed[];
	mentions: PublicUser[];
	mention_roles: Role[];
	pinned: boolean;
	mention_everyone?: boolean;
	tts: boolean;
	timestamp: string;
	edited_timestamp: string | null;
	flags: number;
	components: unknown[];
	hit: true;
}

export interface GuildMessagesSearchResponse {
	messages: GuildMessagesSearchMessage[];
	total_results: number;
}
