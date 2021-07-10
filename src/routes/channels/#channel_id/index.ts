import { ChannelDeleteEvent, ChannelModel, ChannelUpdateEvent, getPermission, GuildUpdateEvent, toObject } from "@fosscord/server-util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.get("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	return res.send(toObject(channel));
});

router.delete("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();

	const permission = await getPermission(req.user_id, channel?.guild_id, channel_id, { channel });
	permission.hasThrow("MANAGE_CHANNELS");

	// TODO: Dm channel "close" not delete
	const data = toObject(channel);

	await emitEvent({ event: "CHANNEL_DELETE", data, guild_id: channel?.guild_id, channel_id } as ChannelDeleteEvent);

	await ChannelModel.deleteOne({ id: channel_id });

	res.send(data);
});

router.patch("/", check(ChannelModifySchema), async (req: Request, res: Response) => {
	var payload = req.body as ChannelModifySchema;
	const { channel_id } = req.params;

	const permission = await getPermission(req.user_id, undefined, channel_id);
	permission.hasThrow("MANAGE_CHANNELS");

	const channel = await ChannelModel.findOneAndUpdate({ id: channel_id }, payload).exec();

	const data = toObject(channel);

	await emitEvent({
		event: "CHANNEL_UPDATE",
		data,
		guild_id: channel.guild_id,
		channel_id
	} as ChannelUpdateEvent);

	res.send(data);
});

export default router;
