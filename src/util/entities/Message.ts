/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { User } from "./User";
import { Member } from "./Member";
import { Role } from "./Role";
import { Channel } from "./Channel";
import { InteractionType } from "../interfaces/Interaction";
import { Application } from "./Application";
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId,
} from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Webhook } from "./Webhook";
import { Sticker } from "./Sticker";
import { Attachment } from "./Attachment";
import { dbEngine } from "../util/Database";
import { NewUrlUserSignatureData } from "../Signing";

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
	ACTION = 13, // /me messages
	GUILD_DISCOVERY_DISQUALIFIED = 14,
	GUILD_DISCOVERY_REQUALIFIED = 15,
	ENCRYPTED = 16,
	REPLY = 19,
	APPLICATION_COMMAND = 20, // application command or self command invocation
	ROUTE_ADDED = 41, // custom message routing: new route affecting that channel
	ROUTE_DISABLED = 42, // custom message routing: given route no longer affecting that channel
	SELF_COMMAND_SCRIPT = 43, // self command scripts
	ENCRYPTION = 50,
	CUSTOM_START = 63,
	UNHANDLED = 255,
}

@Entity({
	name: "messages",
	engine: dbEngine,
})
@Index(["channel_id", "id"], { unique: true })
export class Message extends BaseClass {
	@Column({ nullable: true })
	@RelationId((message: Message) => message.channel)
	@Index()
	channel_id?: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
	})
	channel: Channel;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.guild)
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild?: Guild;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.author)
	@Index()
	author_id?: string;

	@JoinColumn({ name: "author_id", referencedColumnName: "id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	author?: User;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.member)
	member_id?: string;

	@JoinColumn({ name: "member_id", referencedColumnName: "id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	member?: Member;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.webhook)
	webhook_id?: string;

	@JoinColumn({ name: "webhook_id" })
	@ManyToOne(() => Webhook)
	webhook?: Webhook;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.application)
	application_id?: string;

	@JoinColumn({ name: "application_id" })
	@ManyToOne(() => Application)
	application?: Application;

	@Column({ nullable: true })
	content?: string;

	@Column()
	@CreateDateColumn()
	timestamp: Date;

	@Column({ nullable: true })
	edited_timestamp?: Date;

	@Column({ nullable: true })
	tts?: boolean;

	@Column({ nullable: true })
	mention_everyone?: boolean;

	@JoinTable({ name: "message_user_mentions" })
	@ManyToMany(() => User)
	mentions: User[];

	@JoinTable({ name: "message_role_mentions" })
	@ManyToMany(() => Role)
	mention_roles: Role[];

	@JoinTable({ name: "message_channel_mentions" })
	@ManyToMany(() => Channel)
	mention_channels: Channel[];

	@JoinTable({ name: "message_stickers" })
	@ManyToMany(() => Sticker, { cascade: true, onDelete: "CASCADE" })
	sticker_items?: Sticker[];

	@OneToMany(
		() => Attachment,
		(attachment: Attachment) => attachment.message,
		{
			cascade: true,
			orphanedRowAction: "delete",
		},
	)
	attachments?: Attachment[];

	@Column({ type: "simple-json" })
	embeds: Embed[];

	@Column({ type: "simple-json" })
	reactions: Reaction[];

	@Column({ type: "text", nullable: true })
	nonce?: string;

	@Column({ type: "timestamp", nullable: true })
	pinned_at: Date | null;

	@Column({ type: "int" })
	type: MessageType;

	@Column({ type: "simple-json", nullable: true })
	activity?: {
		type: number;
		party_id: string;
	};

	@Column({ default: 0 })
	flags: number;

	@Column({ type: "simple-json", nullable: true })
	message_reference?: {
		message_id: string;
		channel_id?: string;
		guild_id?: string;
	};

	@JoinColumn({ name: "message_reference_id" })
	@ManyToOne(() => Message)
	referenced_message?: Message;

	@Column({ type: "simple-json", nullable: true })
	interaction?: {
		id: string;
		type: InteractionType;
		name: string;
		user_id: string; // the user who invoked the interaction
		// user: User; // TODO: autopopulate user
	};

	@Column({ type: "simple-json", nullable: true })
	components?: ActionRowComponent[];

	@Column({ type: "simple-json", nullable: true })
	poll?: Poll;

	@Column({ nullable: true })
	username?: string;

	@Column({ nullable: true })
	avatar?: string;

	toJSON(): Message {
		return {
			...this,
			author_id: undefined,
			member_id: undefined,
			webhook_id: this.webhook_id ?? undefined,
			application_id: undefined,

			nonce: this.nonce ?? undefined,
			tts: this.tts ?? false,
			guild: this.guild ?? undefined,
			webhook: this.webhook ?? undefined,
			interaction: this.interaction ?? undefined,
			reactions: this.reactions ?? undefined,
			sticker_items: this.sticker_items ?? undefined,
			message_reference: this.message_reference ?? undefined,
			author: {
				...(this.author?.toPublicUser() ?? undefined),
				// Webhooks
				username: this.username ?? this.author?.username,
				avatar: this.avatar ?? this.author?.avatar,
			},
			activity: this.activity ?? undefined,
			application: this.application ?? undefined,
			components: this.components ?? undefined,
			poll: this.poll ?? undefined,
			content: this.content ?? "",
		};
	}

	withSignedAttachments(data: NewUrlUserSignatureData) {
		return {
			...this,
			attachments: this.attachments?.map((attachment: Attachment) =>
				Attachment.prototype.signUrls.call(attachment, data),
			),
		};
	}
}

export interface MessageComponent {
	type: MessageComponentType;
}

export interface ActionRowComponent extends MessageComponent {
	type: MessageComponentType.ActionRow;
	components: (
		| ButtonComponent
		| StringSelectMenuComponent
		| SelectMenuComponent
		| TextInputComponent
	)[];
}

export interface ButtonComponent extends MessageComponent {
	type: MessageComponentType.Button;
	style: ButtonStyle;
	label?: string;
	emoji?: PartialEmoji;
	custom_id?: string;
	sku_id?: string;
	url?: string;
	disabled?: boolean;
}

export enum ButtonStyle {
	Primary = 1,
	Secondary = 2,
	Success = 3,
	Danger = 4,
	Link = 5,
	Premium = 6,
}

export interface SelectMenuComponent extends MessageComponent {
	type:
		| MessageComponentType.StringSelect
		| MessageComponentType.UserSelect
		| MessageComponentType.RoleSelect
		| MessageComponentType.MentionableSelect
		| MessageComponentType.ChannelSelect;
	custom_id: string;
	channel_types?: number[];
	placeholder?: string;
	default_values?: SelectMenuDefaultOption[]; // only for non-string selects
	min_values?: number;
	max_values?: number;
	disabled?: boolean;
}

export interface SelectMenuOption {
	label: string;
	value: string;
	description?: string;
	emoji?: PartialEmoji;
	default?: boolean;
}

export interface SelectMenuDefaultOption {
	id: string;
	type: "user" | "role" | "channel";
}

export interface StringSelectMenuComponent extends SelectMenuComponent {
	type: MessageComponentType.StringSelect;
	options: SelectMenuOption[];
}

export interface TextInputComponent extends MessageComponent {
	type: MessageComponentType.TextInput;
	custom_id: string;
	style: TextInputStyle;
	label: string;
	min_length?: number;
	max_length?: number;
	required?: boolean;
	value?: string;
	placeholder?: string;
}

export enum TextInputStyle {
	Short = 1,
	Paragraph = 2,
}

export enum MessageComponentType {
	Script = 0, // self command script
	ActionRow = 1,
	Button = 2,
	StringSelect = 3,
	TextInput = 4,
	UserSelect = 5,
	RoleSelect = 6,
	MentionableSelect = 7,
	ChannelSelect = 8,
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

export interface Poll {
	question: PollMedia;
	answers: PollAnswer[];
	expiry: Date;
	allow_multiselect: boolean;
	results?: PollResult;
}

export interface PollMedia {
	text?: string;
	emoji?: PartialEmoji;
}

export interface PollAnswer {
	answer_id?: string;
	poll_media: PollMedia;
}

export interface PollResult {
	is_finalized: boolean;
	answer_counts: PollAnswerCount[];
}

export interface PollAnswerCount {
	id: string;
	count: number;
	me_voted: boolean;
}
