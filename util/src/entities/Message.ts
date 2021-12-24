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
	FindConditions,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId,
	RemoveOptions,
	UpdateDateColumn,
} from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Webhook } from "./Webhook";
import { Sticker } from "./Sticker";
import { Attachment } from "./Attachment";

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
@Index(["channel_id", "id"], { unique: true })
export class Message extends BaseClass {
	@Column({ nullable: true })
	@RelationId((message: Message) => message.channel)
	@Index()
	channel_id: string;

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
	author_id: string;

	@JoinColumn({ name: "author_id", referencedColumnName: "id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	author?: User;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.member)
	member_id: string;

	@JoinColumn({ name: "member_id" })
	@ManyToOne(() => Member)
	member?: Member;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.webhook)
	webhook_id: string;

	@JoinColumn({ name: "webhook_id" })
	@ManyToOne(() => Webhook)
	webhook?: Webhook;

	@Column({ nullable: true })
	@RelationId((message: Message) => message.application)
	application_id: string;

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

	@OneToMany(() => Attachment, (attachment: Attachment) => attachment.message, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	attachments?: Attachment[];

	@Column({ type: "simple-json" })
	embeds: Embed[];

	@Column({ type: "simple-json" })
	reactions: Reaction[];

	@Column({ type: "text", nullable: true })
	nonce?: string;

	@Column({ nullable: true })
	pinned?: boolean;

	@Column({ type: "int" })
	type: MessageType;

	@Column({ type: "simple-json", nullable: true })
	activity?: {
		type: number;
		party_id: string;
	};

	@Column({ nullable: true })
	flags?: string;
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
	components?: MessageComponent[];
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
