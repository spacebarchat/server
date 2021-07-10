import {
	ChannelModel,
	ChannelPinsUpdateEvent,
	Config,
	getPermission,
	MessageModel,
	MessageUpdateEvent,
	toObject
} from "@fosscord/server-util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";

const router: Router = Router();

router.put("/:message_id", async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;
	const channel = await ChannelModel.findOne({ id: channel_id }).exec();
	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	// * in dm channels anyone can pin messages -> only check for guilds
	if (channel.guild_id) permission.hasThrow("MANAGE_MESSAGES");

	const pinned_count = await MessageModel.count({ channel_id, pinned: true }).exec();
	const { maxPins } = Config.get().limits.channel;
	if (pinned_count >= maxPins) throw new HTTPError("Max pin count reached: " + maxPins);

	await MessageModel.updateOne({ id: message_id }, { pinned: true }).exec();
	const message = toObject(await MessageModel.findOne({ id: message_id }).exec());

	await emitEvent({
		event: "MESSAGE_UPDATE",
		channel_id,
		guild_id: channel.guild_id,
		data: message
	} as MessageUpdateEvent);

	await emitEvent({
		event: "CHANNEL_PINS_UPDATE",
		channel_id,
		guild_id: channel.guild_id,
		data: {
			channel_id,
			guild_id: channel.guild_id,
			last_pin_timestamp: undefined
		}
	} as ChannelPinsUpdateEvent);

	res.sendStatus(204);
});

router.delete("/:message_id", async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");
	if (channel.guild_id) permission.hasThrow("MANAGE_MESSAGES");

	const message = toObject(await MessageModel.findOneAndUpdate({ id: message_id }, { pinned: false }).exec());

	await emitEvent({
		event: "MESSAGE_UPDATE",
		channel_id,
		guild_id: channel.guild_id,
		data: message
	} as MessageUpdateEvent);

	await emitEvent({
		event: "CHANNEL_PINS_UPDATE",
		channel_id,
		guild_id: channel.guild_id,
		data: {
			channel_id,
			guild_id: channel.guild_id,
			last_pin_timestamp: undefined
		}
	} as ChannelPinsUpdateEvent);

	res.sendStatus(204);
});

router.get("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();
	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	let pins = await MessageModel.find({ channel_id: channel_id, pinned: true }).exec();

	res.send(toObject(pins));
});

export default router;
