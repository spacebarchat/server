import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Message } from "./Message";
import { User } from "./User";
import { HTTPError } from "lambert-server";
import { emitEvent, getPermission, Snowflake } from "../util";
import { ChannelCreateEvent } from "../interfaces";
import { Recipient } from "./Recipient";

export enum ChannelType {
	GUILD_TEXT = 0, // a text channel within a server
	DM = 1, // a direct message between users
	GUILD_VOICE = 2, // a voice channel within a server
	GROUP_DM = 3, // a direct message between multiple users
	GUILD_CATEGORY = 4, // an organizational category that contains up to 50 channels
	GUILD_NEWS = 5, // a channel that users can follow and crosspost into their own server
	GUILD_STORE = 6, // a channel in which game developers can sell their game on Discord
	// TODO: what are channel types between 7-9?
	GUILD_NEWS_THREAD = 10, // a temporary sub-channel within a GUILD_NEWS channel
	GUILD_PUBLIC_THREAD = 11, // a temporary sub-channel within a GUILD_TEXT channel
	GUILD_PRIVATE_THREAD = 12, // a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
	GUILD_STAGE_VOICE = 13, // a voice channel for hosting events with an audience
}

@Entity("channels")
export class Channel extends BaseClass {
	@Column()
	created_at: Date;

	@Column({ nullable: true })
	name?: string;

	@Column({ type: "simple-enum", enum: ChannelType })
	type: ChannelType;

	@OneToMany(() => Recipient, (recipient: Recipient) => recipient.channel, { cascade: true })
	recipients?: Recipient[];

	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.last_message)
	last_message_id: string;

	@JoinColumn({ name: "last_message_id" })
	@ManyToOne(() => Message)
	last_message?: Message;

	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.guild)
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild)
	guild: Guild;

	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.parent)
	parent_id: string;

	@JoinColumn({ name: "parent_id" })
	@ManyToOne(() => Channel)
	parent?: Channel;

	// only for group dms
	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.owner)
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User)
	owner: User;

	@Column({ nullable: true })
	last_pin_timestamp?: number;

	@Column({ nullable: true })
	default_auto_archive_duration?: number;

	@Column({ nullable: true })
	position?: number;

	@Column({ type: "simple-json", nullable: true })
	permission_overwrites?: ChannelPermissionOverwrite[];

	@Column({ nullable: true })
	video_quality_mode?: number;

	@Column({ nullable: true })
	bitrate?: number;

	@Column({ nullable: true })
	user_limit?: number;

	@Column({ nullable: true })
	nsfw?: boolean;

	@Column({ nullable: true })
	rate_limit_per_user?: number;

	@Column({ nullable: true })
	topic?: string;

	// TODO: DM channel
	static async createChannel(
		channel: Partial<Channel>,
		user_id: string = "0",
		opts?: {
			keepId?: boolean;
			skipExistsCheck?: boolean;
			skipPermissionCheck?: boolean;
			skipEventEmit?: boolean;
		}
	) {
		if (!opts?.skipPermissionCheck) {
			// Always check if user has permission first
			const permissions = await getPermission(user_id, channel.guild_id);
			permissions.hasThrow("MANAGE_CHANNELS");
		}

		switch (channel.type) {
			case ChannelType.GUILD_TEXT:
			case ChannelType.GUILD_VOICE:
				if (channel.parent_id && !opts?.skipExistsCheck) {
					const exists = await Channel.findOneOrFail({ id: channel.parent_id });
					if (!exists) throw new HTTPError("Parent id channel doesn't exist", 400);
					if (exists.guild_id !== channel.guild_id)
						throw new HTTPError("The category channel needs to be in the guild");
				}
				break;
			case ChannelType.GUILD_CATEGORY:
				break;
			case ChannelType.DM:
			case ChannelType.GROUP_DM:
				throw new HTTPError("You can't create a dm channel in a guild");
			// TODO: check if guild is community server
			case ChannelType.GUILD_STORE:
			case ChannelType.GUILD_NEWS:
			default:
				throw new HTTPError("Not yet supported");
		}

		if (!channel.permission_overwrites) channel.permission_overwrites = [];
		// TODO: auto generate position

		channel = {
			...channel,
			...(!opts?.keepId && { id: Snowflake.generate() }),
			created_at: new Date(),
			position: channel.position || 0,
		};

		await Promise.all([
			new Channel(channel).save(),
			!opts?.skipEventEmit
				? emitEvent({
						event: "CHANNEL_CREATE",
						data: channel,
						guild_id: channel.guild_id,
				  } as ChannelCreateEvent)
				: Promise.resolve(),
		]);

		return channel;
	}
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
