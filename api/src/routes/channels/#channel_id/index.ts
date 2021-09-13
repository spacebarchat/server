import { ChannelDeleteEvent, Channel, ChannelUpdateEvent, emitEvent, ChannelType, ChannelPermissionOverwriteType } from "@fosscord/util";
import { Router, Response, Request } from "express";
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

	const channel = await Channel.findOneOrFail({ id: channel_id });

	// TODO: Dm channel "close" not delete
	const data = channel;

	await Promise.all([emitEvent({ event: "CHANNEL_DELETE", data, channel_id } as ChannelDeleteEvent), Channel.delete({ id: channel_id })]);

	res.send(data);
});

export interface ChannelModifySchema {
	/**
	 * @maxLength 100
	 */
	name: string;
	type: ChannelType;
	topic?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: {
		id: string;
		type: ChannelPermissionOverwriteType;
		allow: bigint;
		deny: bigint;
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
