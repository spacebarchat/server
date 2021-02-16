import { Schema, model, Types, Document } from "mongoose";
import { ChannelType } from "./Channel";

export interface Message extends Document {
	id: bigint;
	channel_id: bigint;
	author_id?: bigint;
	webhook_id?: bigint;
	application_id: bigint;
	content: string;
	timestamp: number;
	edited_timestamp: number;
	tts: boolean;
	mention_everyone: boolean;
	mentions: bigint[];
	mention_roles: bigint[];
	mention_channels?: {
		id: bigint;
		guild_id: bigint;
		type: ChannelType;
		name: string;
	}[];
	attachments: Attachment[];
	embeds: Embed[];
	reactions?: Reaction[];
	nonce?: string | number;
	pinned: boolean;
	type: MessageType;
	activity?: {
		type: number;
		party_id: string;
	};
	flags?: bigint;
	stickers?: [];
	message_reference?: {
		message_id: bigint;
		channel_id?: bigint;
		guild_id?: bigint;
	};
}

export enum MessageType {
	DEFAULT = 0,
	RECIPIENT_ADD = 1,
	RECIPIENT_REMOVE = 2,
	CALL = 3,
	CHANNEL_NAME_CHANGE = 4,
	CHANNEL_ICON_CHANGE = 5,
	CHANNEL_PINNED_MESSAGE = 6,
	GUILD_MEMBER_JOIN = 7,
	USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
	USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
	USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
	USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
	CHANNEL_FOLLOW_ADD = 12,
	GUILD_DISCOVERY_DISQUALIFIED = 14,
	GUILD_DISCOVERY_REQUALIFIED = 15,
	REPLY = 19,
	APPLICATION_COMMAND = 20,
}

export interface Attachment {
	id: bigint; // attachment id
	filename: string; // name of file attached
	size: number; // size of file in bytes
	url: string; // source url of file
	proxy_url: string; // a proxied url of file
	height: number; // height of file (if image)
	width: number; // width of file (if image)
}

export interface Embed {
	title?: string; //title of embed
	type?: string; // type of embed (always "rich" for webhook embeds)
	description?: string; // description of embed
	url?: string; // url of embed
	timestamp?: number; // timestamp of embed content
	color?: number; // color code of the embed
	footer?: {
		text: string;
		icon_url?: string;
		proxy_icon_url?: string;
	}; // footer object	footer information
	image?: EmbedImage; // image object	image information
	thumbnail?: EmbedImage; // thumbnail object	thumbnail information
	video?: EmbedImage; // video object	video information
	provider?: {
		name?: string;
		url?: string;
	}; // provider object	provider information
	author?: {
		name?: string;
		url?: string;
		icon_url?: string;
		proxy_icon_url?: string;
	}; // author object	author information
	fields?: {
		name: string;
		value: string;
		inline?: boolean;
	}[];
}

export interface EmbedImage {
	url?: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface Reaction {
	count: number;
	//// not saved in the database // me: boolean; // whether the current user reacted using this emoji
	emoji: PartialEmoji;
}

export interface PartialEmoji {
	id?: bigint;
	name: string;
	animated?: boolean;
}

export interface AllowedMentions {
	parse?: ("users" | "roles" | "everyone")[];
	roles?: bigint[];
	users?: bigint[];
	replied_user?: boolean;
}

const Attachment = {
	id: Types.Long, // attachment id
	filename: String, // name of file attached
	size: Number, // size of file in bytes
	url: String, // source url of file
	proxy_url: String, // a proxied url of file
	height: Number, // height of file (if image)
	width: Number, // width of file (if image)
};

const EmbedImage = {
	url: String,
	proxy_url: String,
	height: Number,
	width: Number,
};

const Reaction = {
	count: Number,
	emoji: {
		id: Types.Long,
		name: String,
		animated: Boolean,
	},
};

const Embed = {
	title: String, //title of embed
	type: String, // type of embed (always "rich" for webhook embeds)
	description: String, // description of embed
	url: String, // url of embed
	timestamp: Number, // timestamp of embed content
	color: Number, // color code of the embed
	footer: {
		text: String,
		icon_url: String,
		proxy_icon_url: String,
	}, // footer object	footer information
	image: EmbedImage, // image object	image information
	thumbnail: EmbedImage, // thumbnail object	thumbnail information
	video: EmbedImage, // video object	video information
	provider: {
		name: String,
		url: String,
	}, // provider object	provider information
	author: {
		name: String,
		url: String,
		icon_url: String,
		proxy_icon_url: String,
	}, // author object	author information
	fields: [
		{
			name: String,
			value: String,
			inline: Boolean,
		},
	],
};

export const MessageSchema = new Schema({
	id: Types.Long,
	channel_id: Types.Long,
	author_id: Types.Long,
	webhook_id: Types.Long,
	application_id: Types.Long,
	content: String,
	timestamp: Number,
	edited_timestamp: Number,
	tts: Boolean,
	mention_everyone: Boolean,
	mentions: [Types.Long],
	mention_roles: [Types.Long],
	mention_channels: [
		{
			id: Types.Long,
			guild_id: Types.Long,
			type: { type: Number },
			name: String,
		},
	],
	attachments: [Attachment],
	embeds: [Embed],
	reactions: [Reaction],
	nonce: Schema.Types.Mixed, // can be a long or a string
	pinned: Boolean,
	type: Number,
	activity: {
		type: Number,
		party_id: String,
	},
	flags: Types.Long,
	stickers: [],
	message_reference: {
		message_id: Types.Long,
		channel_id: Types.Long,
		guild_id: Types.Long,
	},
});

export const MessageModel = model<Message>("Message", MessageSchema, "messages");
