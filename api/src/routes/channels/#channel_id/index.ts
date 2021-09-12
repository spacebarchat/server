import { ChannelDeleteEvent, Channel, ChannelUpdateEvent, emitEvent, getPermission } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";
import { check } from "@fosscord/api";
const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.get("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ id: channel_id });

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	return res.send(channel);
});

router.delete("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ id: channel_id });

	const permission = await getPermission(req.user_id, channel?.guild_id, channel_id);
	permission.hasThrow("MANAGE_CHANNELS");

	// TODO: Dm channel "close" not delete
	const data = channel;

	await emitEvent({ event: "CHANNEL_DELETE", data, channel_id } as ChannelDeleteEvent);

	await Channel.delete({ id: channel_id });

	res.send(data);
});

router.patch("/", check(ChannelModifySchema), async (req: Request, res: Response) => {
	var payload = req.body as ChannelModifySchema;
	const { channel_id } = req.params;

	const permission = await getPermission(req.user_id, undefined, channel_id);
	permission.hasThrow("MANAGE_CHANNELS");

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
