import { ChannelModel, getPermission, MessageModel, toObject } from "@fosscord/server-util";
import { Router, Request, Response } from "express";
import Config from "../../../util/Config";
import { HTTPError } from "lambert-server";

const router: Router = Router();

// TODO: auto throw error if findOne doesn't find anything

router.put("/:message_id", async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;
	const channel = await ChannelModel.findOne({ id: channel_id }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);
	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	// * in dm channels anyone can pin messages -> only check for guilds
	if (channel.guild_id) permission.hasThrow("MANAGE_MESSAGES");

	const pinned_count = await MessageModel.count({ channel_id, pinned: true }).exec();
	const { maxPins } = Config.get().limits.channel;
	if (pinned_count >= maxPins) throw new HTTPError("Max pin count reached: " + maxPins);

	await MessageModel.updateOne({ id: message_id }, { pinned: true }).exec();

	res.sendStatus(204);
});

router.get("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);
	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	let pins = await MessageModel.find({ channel_id: channel_id, pinned: true }).exec();

	res.send(toObject(pins));
});

export default router;
