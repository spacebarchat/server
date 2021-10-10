import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { PublicUserProjection, User } from "./User";
import { HTTPError } from "lambert-server";
import { containsAll, emitEvent, getPermission, Snowflake, trimSpecial } from "../util";
import { ChannelCreateEvent, ChannelRecipientRemoveEvent } from "../interfaces";
import { Recipient } from "./Recipient";
import { Message } from "./Message";
import { ReadState } from "./ReadState";
import { Invite } from "./Invite";
import { VoiceState } from "./VoiceState";
import { Webhook } from "./Webhook";
import { DmChannelDTO } from "../dtos";

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

	@Column({ type: "text", nullable: true })
	icon?: string | null;

	@Column({ type: "int" })
	type: ChannelType;

	@OneToMany(() => Recipient, (recipient: Recipient) => recipient.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	recipients?: Recipient[];

	@Column({ nullable: true })
	last_message_id: string;

	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.guild)
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
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

	@OneToMany(() => Invite, (invite: Invite) => invite.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	invites?: Invite[];

	@OneToMany(() => Message, (message: Message) => message.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	messages?: Message[];

	@OneToMany(() => VoiceState, (voice_state: VoiceState) => voice_state.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	voice_states?: VoiceState[];

	@OneToMany(() => ReadState, (read_state: ReadState) => read_state.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	read_states?: ReadState[];

	@OneToMany(() => Webhook, (webhook: Webhook) => webhook.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	webhooks?: Webhook[];

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

	static async createDMChannel(recipients: string[], creator_user_id: string, name?: string) {
		recipients = recipients.unique().filter((x) => x !== creator_user_id);
		const otherRecipientsUsers = await User.find({ where: recipients.map((x) => ({ id: x })), select: ["id"] });

		// TODO: check config for max number of recipients
		if (otherRecipientsUsers.length !== recipients.length) {
			throw new HTTPError("Recipient/s not found");
		}

		const type = recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;

		let channel = null;

		const channelRecipients = [...recipients, creator_user_id];

		const userRecipients = await Recipient.find({
			where: { user_id: creator_user_id },
			relations: ["channel", "channel.recipients"],
		});

		for (let ur of userRecipients) {
			let re = ur.channel.recipients!.map((r) => r.user_id);
			if (re.length === channelRecipients.length) {
				if (containsAll(re, channelRecipients)) {
					if (channel == null) {
						channel = ur.channel;
						await ur.assign({ closed: false }).save();
					}
				}
			}
		}

		if (channel == null) {
			name = trimSpecial(name);

			channel = await new Channel({
				name,
				type,
				owner_id: type === ChannelType.DM ? undefined : creator_user_id,
				created_at: new Date(),
				last_message_id: null,
				recipients: channelRecipients.map(
					(x) =>
						new Recipient({ user_id: x, closed: !(type === ChannelType.GROUP_DM || x === creator_user_id) })
				),
			}).save();
		}

		const channel_dto = await DmChannelDTO.from(channel);

		if (type === ChannelType.GROUP_DM) {
			for (let recipient of channel.recipients!) {
				await emitEvent({
					event: "CHANNEL_CREATE",
					data: channel_dto.excludedRecipients([recipient.user_id]),
					user_id: recipient.user_id,
				});
			}
		} else {
			await emitEvent({ event: "CHANNEL_CREATE", data: channel_dto, user_id: creator_user_id });
		}

		return channel_dto.excludedRecipients([creator_user_id]);
	}

	static async removeRecipientFromChannel(channel: Channel, user_id: string) {
		await Recipient.delete({ channel_id: channel.id, user_id: user_id });
		channel.recipients = channel.recipients?.filter((r) => r.user_id !== user_id);

		if (channel.recipients?.length === 0) {
			await Channel.deleteChannel(channel);
			await emitEvent({
				event: "CHANNEL_DELETE",
				data: await DmChannelDTO.from(channel, [user_id]),
				user_id: user_id,
			});
			return;
		}

		await emitEvent({
			event: "CHANNEL_DELETE",
			data: await DmChannelDTO.from(channel, [user_id]),
			user_id: user_id,
		});

		//If the owner leave we make the first recipient in the list the new owner
		if (channel.owner_id === user_id) {
			channel.owner_id = channel.recipients!.find((r) => r.user_id !== user_id)!.user_id; //Is there a criteria to choose the new owner?
			await emitEvent({
				event: "CHANNEL_UPDATE",
				data: await DmChannelDTO.from(channel, [user_id]),
				channel_id: channel.id,
			});
		}

		await channel.save();

		await emitEvent({
			event: "CHANNEL_RECIPIENT_REMOVE",
			data: {
				channel_id: channel.id,
				user: await User.findOneOrFail({ where: { id: user_id }, select: PublicUserProjection }),
			},
			channel_id: channel.id,
		} as ChannelRecipientRemoveEvent);
	}

	static async deleteChannel(channel: Channel) {
		await Message.delete({ channel_id: channel.id }); //TODO we should also delete the attachments from the cdn but to do that we need to move cdn.ts in util
		//TODO before deleting the channel we should check and delete other relations
		await Channel.delete({ id: channel.id });
	}

	isDm() {
		return this.type === ChannelType.DM || this.type === ChannelType.GROUP_DM;
	}
}

export interface ChannelPermissionOverwrite {
	allow: string;
	deny: string;
	id: string;
	type: ChannelPermissionOverwriteType;
}

export enum ChannelPermissionOverwriteType {
	role = 0,
	member = 1,
}
