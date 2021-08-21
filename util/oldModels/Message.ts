import { Schema, Types, Document } from "mongoose";
import db from "../util/Database";
import { PublicUser, PublicUserProjection, UserModel } from "./User";
import { MemberModel, PublicMember } from "./Member";
import { Role, RoleModel } from "./Role";
import { Channel } from "./Channel";
import { Snowflake } from "../util";
import { InteractionType } from "./Interaction";

export interface Message {
	id: string;
	channel_id: string;
	guild_id?: string;
	author_id?: string;
	webhook_id?: string;
	application_id?: string;
	content?: string;
	timestamp: Date;
	edited_timestamp: Date | null;
	tts?: boolean;
	mention_everyone?: boolean;
	mention_user_ids: string[];
	mention_role_ids: string[];
	mention_channels_ids: string[];
	attachments: Attachment[];
	embeds: Embed[];
	reactions: Reaction[];
	nonce?: string | number;
	pinned?: boolean;
	type: MessageType;
	activity?: {
		type: number;
		party_id: string;
	};
	flags?: bigint;
	stickers?: any[];
	message_reference?: {
		message_id: string;
		channel_id?: string;
		guild_id?: string;
	};
	interaction?: {
		id: string;
		type: InteractionType;
		name: string;
		user_id: string; // the user who invoked the interaction
		// user: User; // TODO: autopopulate user
	};
	components: MessageComponent[];

	// * mongoose virtuals:
	// TODO:
	// application: Application; // TODO: auto pouplate application
	author?: PublicUser;
	member?: PublicMember;
	mentions?: (PublicUser & {
		member: PublicMember;
	})[];
	mention_roles?: Role[];
	mention_channels?: Channel[];
	created_at?: Date;
	// thread // TODO
}

const PartialEmoji = {
	id: String,
	name: { type: String, required: true },
	animated: { type: Boolean, required: true },
};

const MessageComponent: any = {
	type: { type: Number, required: true },
	style: Number,
	label: String,
	emoji: PartialEmoji,
	custom_id: String,
	url: String,
	disabled: Boolean,
	components: [Object],
};

export interface MessageComponent {
	type: number;
	style?: number;
	label?: string;
	emoji?: PartialEmoji;
	custom_id?: string;
	url?: string;
	disabled?: boolean;
	components: MessageComponent[];
}

export enum MessageComponentType {
	ActionRow = 1,
	Button = 2,
}

export interface MessageDocument extends Document, Message {
	id: string;
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
	id: string; // attachment id
	filename: string; // name of file attached
	size: number; // size of file in bytes
	url: string; // source url of file
	proxy_url: string; // a proxied url of file
	height?: number; // height of file (if image)
	width?: number; // width of file (if image)
	content_type?: string;
}

export interface Embed {
	title?: string; //title of embed
	type?: EmbedType; // type of embed (always "rich" for webhook embeds)
	description?: string; // description of embed
	url?: string; // url of embed
	timestamp?: Date; // timestamp of embed content
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

export enum EmbedType {
	rich = "rich",
	image = "image",
	video = "video",
	gifv = "gifv",
	article = "article",
	link = "link",
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
	user_ids: string[];
}

export interface PartialEmoji {
	id?: string;
	name: string;
	animated?: boolean;
}

export interface AllowedMentions {
	parse?: ("users" | "roles" | "everyone")[];
	roles?: string[];
	users?: string[];
	replied_user?: boolean;
}

export const Attachment = {
	id: String, // attachment id
	filename: String, // name of file attached
	size: Number, // size of file in bytes
	url: String, // source url of file
	proxy_url: String, // a proxied url of file
	height: Number, // height of file (if image)
	width: Number, // width of file (if image)
	content_type: String,
};

export const EmbedImage = {
	url: String,
	proxy_url: String,
	height: Number,
	width: Number,
};

const Reaction = {
	count: Number,
	user_ids: [String],
	emoji: {
		id: String,
		name: String,
		animated: Boolean,
	},
};

export const Embed = {
	title: String, //title of embed
	type: { type: String }, // type of embed (always "rich" for webhook embeds)
	description: String, // description of embed
	url: String, // url of embed
	timestamp: Date, // timestamp of embed content
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
	id: String,
	channel_id: String,
	author_id: String,
	webhook_id: String,
	guild_id: String,
	application_id: String,
	content: String,
	timestamp: Date,
	edited_timestamp: Date,
	tts: Boolean,
	mention_everyone: Boolean,
	mention_user_ids: [String],
	mention_role_ids: [String],
	mention_channel_ids: [String],
	attachments: [Attachment],
	embeds: [Embed],
	reactions: [Reaction],
	nonce: Schema.Types.Mixed, // can be a long or a string
	pinned: Boolean,
	type: { type: Number },
	activity: {
		type: { type: Number },
		party_id: String,
	},
	flags: Types.Long,
	stickers: [],
	message_reference: {
		message_id: String,
		channel_id: String,
		guild_id: String,
	},
	components: [MessageComponent],
	// virtual:
	// author: {
	// 	ref: UserModel,
	// 	localField: "author_id",
	// 	foreignField: "id",
	// 	justOne: true,
	// 	autopopulate: { select: { id: true, user_data: false } },
	// },
});

MessageSchema.virtual("author", {
	ref: UserModel,
	localField: "author_id",
	foreignField: "id",
	justOne: true,
	autopopulate: { select: PublicUserProjection },
});

MessageSchema.virtual("member", {
	ref: MemberModel,
	localField: "author_id",
	foreignField: "id",
	justOne: true,
});

MessageSchema.virtual("mentions", {
	ref: UserModel,
	localField: "mention_user_ids",
	foreignField: "id",
	justOne: false,
	autopopulate: { select: PublicUserProjection },
});

MessageSchema.virtual("mention_roles", {
	ref: RoleModel,
	localField: "mention_role_ids",
	foreignField: "id",
	justOne: false,
	autopopulate: true,
});

MessageSchema.virtual("mention_channels", {
	ref: RoleModel,
	localField: "mention_channel_ids",
	foreignField: "id",
	justOne: false,
	autopopulate: { select: { id: true, guild_id: true, type: true, name: true } },
});

MessageSchema.virtual("referenced_message", {
	ref: "Message",
	localField: "message_reference.message_id",
	foreignField: "id",
	justOne: true,
	autopopulate: true,
});

MessageSchema.virtual("created_at").get(function (this: MessageDocument) {
	return new Date(Snowflake.deconstruct(this.id).timestamp);
});

MessageSchema.set("removeResponse", ["mention_channel_ids", "mention_role_ids", "mention_user_ids", "author_id"]);

// TODO: missing Application Model
// MessageSchema.virtual("application", {
// 	ref: Application,
// 	localField: "mention_role_ids",
// 	foreignField: "id",
// 	justOne: true,
// });

// @ts-ignore
export const MessageModel = db.model<MessageDocument>("Message", MessageSchema, "messages");
