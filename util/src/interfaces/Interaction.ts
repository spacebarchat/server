import { AllowedMentions, Embed } from "../entities/Message";

export interface Interaction {
	id: string;
	type: InteractionType;
	data?: {};
	guild_id: string;
	channel_id: string;
	member_id: string;
	token: string;
	version: number;
}

export enum InteractionType {
	Ping = 1,
	ApplicationCommand = 2,
}

export enum InteractionResponseType {
	Pong = 1,
	Acknowledge = 2,
	ChannelMessage = 3,
	ChannelMessageWithSource = 4,
	AcknowledgeWithSource = 5,
}

export interface InteractionApplicationCommandCallbackData {
	tts?: boolean;
	content: string;
	embeds?: Embed[];
	allowed_mentions?: AllowedMentions;
}
