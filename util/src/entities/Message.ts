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
	JoinColumn,
	ManyToMany,
	ManyToOne,
	RelationId,
	UpdateDateColumn,
} from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Webhook } from "./Webhook";
import { Sticker } from "./Sticker";

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

@Entity("messages")
export class Message extends BaseClass {
	@Column()
	id: string;

	@RelationId((message: Message) => message.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	channel: Channel;

	@RelationId((message: Message) => message.guild)
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild?: Guild;

	@RelationId((message: Message) => message.author)
	author_id: string;

	@JoinColumn({ name: "author_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	author?: User;

	@RelationId((message: Message) => message.member)
	member_id: string;

	@JoinColumn({ name: "member_id" })
	@ManyToOne(() => Member, (member: Member) => member.id)
	member?: Member;

	@RelationId((message: Message) => message.webhook)
	webhook_id: string;

	@JoinColumn({ name: "webhook_id" })
	@ManyToOne(() => Webhook, (webhook: Webhook) => webhook.id)
	webhook?: Webhook;

	@RelationId((message: Message) => message.application)
	application_id: string;

	@JoinColumn({ name: "application_id" })
	@ManyToOne(() => Application, (application: Application) => application.id)
	application?: Application;

	@Column({ nullable: true })
	content?: string;

	@Column()
	@CreateDateColumn()
	timestamp: Date;

	@Column()
	@UpdateDateColumn()
	edited_timestamp?: Date;

	@Column({ nullable: true })
	tts?: boolean;

	@Column({ nullable: true })
	mention_everyone?: boolean;

	@RelationId((message: Message) => message.mentions)
	mention_user_ids: string[];

	@JoinColumn({ name: "mention_user_ids" })
	@ManyToMany(() => User, (user: User) => user.id)
	mentions: User[];

	@RelationId((message: Message) => message.mention_roles)
	mention_role_ids: string[];

	@JoinColumn({ name: "mention_role_ids" })
	@ManyToMany(() => Role, (role: Role) => role.id)
	mention_roles: Role[];

	@RelationId((message: Message) => message.mention_channels)
	mention_channel_ids: string[];

	@JoinColumn({ name: "mention_channel_ids" })
	@ManyToMany(() => Channel, (channel: Channel) => channel.id)
	mention_channels: Channel[];

	@Column({ type: "simple-json" })
	attachments: Attachment[];

	@Column({ type: "simple-json" })
	embeds: Embed[];

	@Column({ type: "simple-json" })
	reactions: Reaction[];

	@Column({ type: "text", nullable: true })
	nonce?: string | number;

	@Column({ nullable: true })
	pinned?: boolean;

	@Column({ type: "simple-enum", enum: MessageType })
	type: MessageType;

	@Column({ type: "simple-json", nullable: true })
	activity?: {
		type: number;
		party_id: string;
	};

	@Column({ nullable: true })
	flags?: string;

	@RelationId((message: Message) => message.stickers)
	sticker_ids: string[];

	@JoinColumn({ name: "sticker_ids" })
	@ManyToMany(() => Sticker, (sticker: Sticker) => sticker.id)
	stickers?: Sticker[];

	@Column({ type: "simple-json", nullable: true })
	message_reference?: {
		message_id: string;
		channel_id?: string;
		guild_id?: string;
	};

	@JoinColumn({ name: "message_reference_id" })
	@ManyToOne(() => Message, (message: Message) => message.id)
	referenced_message?: Message;

	@Column({ type: "simple-json", nullable: true })
	interaction?: {
		id: string;
		type: InteractionType;
		name: string;
		user_id: string; // the user who invoked the interaction
		// user: User; // TODO: autopopulate user
	};

	@Column({ type: "simple-json" })
	components: MessageComponent[];
}

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
