import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
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

	@Column("simple-array")
	recipient_ids: string[];

	@JoinColumn({ name: "recipient_ids" })
	@ManyToMany(() => User, (user: User) => user.id)
	recipients?: User[];

	@Column()
	last_message_id: string;

	@JoinColumn({ name: "last_message_id" })
	@ManyToOne(() => Message, (message: Message) => message.id)
	last_message?: Message;

	@Column()
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@Column()
	parent_id: string;

	@JoinColumn({ name: "parent_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	parent?: Channel;

	@Column()
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	owner: User;

	@Column()
	last_pin_timestamp?: number;

	@Column()
	default_auto_archive_duration?: number;

	@Column()
	position: number;

	@Column("simple-json")
	permission_overwrites: ChannelPermissionOverwrite[];

	@Column()
	video_quality_mode?: number;

	@Column()
	bitrate?: number;

	@Column()
	user_limit?: number;

	@Column()
	nsfw: boolean;

	@Column()
	rate_limit_per_user: number;

	@Column()
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
