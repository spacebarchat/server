import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Message } from "./Message";
import { User } from "./User";

export enum ChannelType {
	GUILD_TEXT = 0, // a text channel within a server
	DM = 1, // a direct message between users
	GUILD_VOICE = 2, // a voice channel within a server
	GROUP_DM = 3, // a direct message between multiple users
	GUILD_CATEGORY = 4, // an organizational category that contains up to 50 channels
	GUILD_NEWS = 5, // a channel that users can follow and crosspost into their own server
	GUILD_STORE = 6, // a channel in which game developers can sell their game on Discord
}

@Entity("channels")
export class Channel extends BaseClass {
	@Column()
	created_at: Date;

	@Column()
	name: string;

	@Column({ type: "simple-enum", enum: ChannelType })
	type: ChannelType;

	@RelationId((channel: Channel) => channel.recipients)
	recipient_ids: string[];

	@JoinColumn({ name: "recipient_ids" })
	@ManyToMany(() => User, (user: User) => user.id)
	recipients?: User[];

	@RelationId((channel: Channel) => channel.last_message)
	last_message_id: string;

	@JoinColumn({ name: "last_message_id" })
	@ManyToOne(() => Message, (message: Message) => message.id)
	last_message?: Message;

	@RelationId((channel: Channel) => channel.guild)
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@RelationId((channel: Channel) => channel.parent)
	parent_id: string;

	@JoinColumn({ name: "parent_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	parent?: Channel;

	@RelationId((channel: Channel) => channel.owner)
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	owner: User;

	@Column({ nullable: true })
	last_pin_timestamp?: number;

	@Column({ nullable: true })
	default_auto_archive_duration?: number;

	@Column()
	position: number;

	@Column({ type: "simple-json" })
	permission_overwrites: ChannelPermissionOverwrite[];

	@Column({ nullable: true })
	video_quality_mode?: number;

	@Column({ nullable: true })
	bitrate?: number;

	@Column({ nullable: true })
	user_limit?: number;

	@Column()
	nsfw: boolean;

	@Column()
	rate_limit_per_user: number;

	@Column({ nullable: true })
	topic?: string;
}

export interface ChannelPermissionOverwrite {
	allow: bigint; // for bitfields we use bigints
	deny: bigint; // for bitfields we use bigints
	id: string;
	type: ChannelPermissionOverwriteType;
}

export enum ChannelPermissionOverwriteType {
	role = 0,
	member = 1,
}
