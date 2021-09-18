import { Channel, ChannelType, Message, PublicUserProjection, Recipient, User } from "../entities";
import { HTTPError } from "lambert-server";
import { emitEvent, trimSpecial } from "../util";
import { DmChannelDTO } from "../dtos";
import { ChannelRecipientRemoveEvent } from "../interfaces";

export function checker(arr: any[], target: any[]) {
	return target.every(v => arr.includes(v));
}

export class ChannelService {
	public static async createDMChannel(recipients: string[], creator_user_id: string, name?: string) {
		recipients = recipients.unique().filter((x) => x !== creator_user_id);
		const otherRecipientsUsers = await User.find({ where: recipients.map((x) => ({ id: x })) });

		// TODO: check config for max number of recipients
		if (otherRecipientsUsers.length !== recipients.length) {
			throw new HTTPError("Recipient/s not found");
		}

		const type = recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;

		let channel = null;

		const channelRecipients = [...recipients, creator_user_id]

		const userRecipients = await Recipient.find({ where: { user_id: creator_user_id }, relations: ["channel", "channel.recipients"] })

		for (let ur of userRecipients) {
			let re = ur.channel.recipients!.map(r => r.user_id)
			if (re.length === channelRecipients.length) {
				if (checker(re, channelRecipients)) {
					if (channel == null) {
						channel = ur.channel
						await ur.assign({ closed: false }).save()
					}
				}
			}
		}

		if (channel == null) {
			name = trimSpecial(name);

			channel = await new Channel({
				name,
				type,
				owner_id: (type === ChannelType.DM ? undefined : creator_user_id),
				created_at: new Date(),
				last_message_id: null,
				recipients: channelRecipients.map((x) => new Recipient({ user_id: x, closed: !(type === ChannelType.GROUP_DM || x === creator_user_id) })),
			}).save();
		}


		const channel_dto = await DmChannelDTO.from(channel)

		if (type === ChannelType.GROUP_DM) {

			for (let recipient of channel.recipients!) {
				await emitEvent({
					event: "CHANNEL_CREATE",
					data: channel_dto.excludedRecipients([recipient.user_id]),
					user_id: recipient.user_id
				})
			}
		} else {
			await emitEvent({ event: "CHANNEL_CREATE", data: channel_dto, user_id: creator_user_id });
		}

		return channel_dto.excludedRecipients([creator_user_id])
	}

	public static async removeRecipientFromChannel(channel: Channel, user_id: string) {
		await Recipient.delete({ channel_id: channel.id, user_id: user_id })
		channel.recipients = channel.recipients?.filter(r => r.user_id !== user_id)

		if (channel.recipients?.length === 0) {
			await ChannelService.deleteChannel(channel);
			await emitEvent({
				event: "CHANNEL_DELETE",
				data: await DmChannelDTO.from(channel, [user_id]),
				user_id: user_id
			});
			return
		}

		await emitEvent({
			event: "CHANNEL_DELETE",
			data: await DmChannelDTO.from(channel, [user_id]),
			user_id: user_id
		});

		//If the owner leave we make the first recipient in the list the new owner
		if (channel.owner_id === user_id) {
			channel.owner_id = channel.recipients!.find(r => r.user_id !== user_id)!.user_id //Is there a criteria to choose the new owner?
			await emitEvent({
				event: "CHANNEL_UPDATE",
				data: await DmChannelDTO.from(channel, [user_id]),
				channel_id: channel.id
			});
		}

		await channel.save()

		await emitEvent({
			event: "CHANNEL_RECIPIENT_REMOVE", data: {
				channel_id: channel.id,
				user: await User.findOneOrFail({ where: { id: user_id }, select: PublicUserProjection })
			}, channel_id: channel.id
		} as ChannelRecipientRemoveEvent);
	}

	public static async deleteChannel(channel: Channel) {
		await Message.delete({ channel_id: channel.id }) //TODO we should also delete the attachments from the cdn but to do that we need to move cdn.ts in util
		//TODO before deleting the channel we should check and delete other relations
		await Channel.delete({ id: channel.id })
	}
}
