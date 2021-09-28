import {
	Channel,
	ChannelDeleteEvent,
	ChannelPermissionOverwriteType,
	ChannelType,
	ChannelUpdateEvent,
	emitEvent,
	Recipient,
	handleFile
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.get("/", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ id: channel_id });

	return res.send(channel);
});

router.delete("/", route({ permission: "MANAGE_CHANNELS" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });

	if (channel.type === ChannelType.DM) {
		const recipient = await Recipient.findOneOrFail({ where: { channel_id: channel_id, user_id: req.user_id } });
		recipient.closed = true;
		await Promise.all([
			recipient.save(),
			emitEvent({ event: "CHANNEL_DELETE", data: channel, user_id: req.user_id } as ChannelDeleteEvent)
		]);
	} else if (channel.type === ChannelType.GROUP_DM) {
		await Channel.removeRecipientFromChannel(channel, req.user_id);
	} else {
		await Promise.all([
			Channel.delete({ id: channel_id }),
			emitEvent({ event: "CHANNEL_DELETE", data: channel, channel_id } as ChannelDeleteEvent)
		]);
	}

	res.send(channel);
});

export interface ChannelModifySchema {
	/**
	 * @maxLength 100
	 */
	name?: string;
	type?: ChannelType;
	topic?: string;
	icon?: string | null;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: {
		id: string;
		type: ChannelPermissionOverwriteType;
		allow: string;
		deny: string;
	}[];
	parent_id?: string;
	id?: string; // is not used (only for guild create)
	nsfw?: boolean;
	rtc_region?: string;
	default_auto_archive_duration?: number;
}

router.patch("/", route({ body: "ChannelModifySchema", permission: "MANAGE_CHANNELS" }), async (req: Request, res: Response) => {
	var payload = req.body as ChannelModifySchema;
	const { channel_id } = req.params;
	if (payload.icon) payload.icon = await handleFile(`/channel-icons/${channel_id}`, payload.icon);

	const channel = await Channel.findOneOrFail({ id: channel_id });
	channel.assign(payload);

	await Promise.all([
		channel.save(),
		emitEvent({
			event: "CHANNEL_UPDATE",
			data: channel,
			channel_id
		} as ChannelUpdateEvent)
	]);

	res.send(channel);
});

export default router;
