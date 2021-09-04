import { Channel, ChannelPinsUpdateEvent, Config, emitEvent, getPermission, Message, MessageUpdateEvent } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { DiscordApiErrors } from "@fosscord/util";

const router: Router = Router();

router.put("/:message_id", async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const message = await Message.findOneOrFail({ id: message_id });
	const permission = await getPermission(req.user_id, message.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	// * in dm channels anyone can pin messages -> only check for guilds
	if (message.guild_id) permission.hasThrow("MANAGE_MESSAGES");

	const pinned_count = await Message.count({ channel: { id: channel_id }, pinned: true });
	const { maxPins } = Config.get().limits.channel;
	if (pinned_count >= maxPins) throw DiscordApiErrors.MAXIMUM_PINS.withParams(maxPins);

	await Promise.all([
		Message.update({ id: message_id }, { pinned: true }),
		emitEvent({
			event: "MESSAGE_UPDATE",
			channel_id,
			data: message
		} as MessageUpdateEvent),

		emitEvent({
			event: "CHANNEL_PINS_UPDATE",
			channel_id,
			data: {
				channel_id,
				guild_id: message.guild_id,
				last_pin_timestamp: undefined
			}
		} as ChannelPinsUpdateEvent)
	]);

	res.sendStatus(204);
});

router.delete("/:message_id", async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const channel = await Channel.findOneOrFail({ id: channel_id });

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");
	if (channel.guild_id) permission.hasThrow("MANAGE_MESSAGES");

	const message = await Message.findOneOrFail({ id: message_id });
	message.pinned = false;

	await Promise.all([
		message.save(),

		emitEvent({
			event: "MESSAGE_UPDATE",
			channel_id,
			data: message
		} as MessageUpdateEvent),

		emitEvent({
			event: "CHANNEL_PINS_UPDATE",
			channel_id,
			data: {
				channel_id,
				guild_id: channel.guild_id,
				last_pin_timestamp: undefined
			}
		} as ChannelPinsUpdateEvent)
	]);

	res.sendStatus(204);
});

router.get("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ id: channel_id });
	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	let pins = await Message.find({ channel_id: channel_id, pinned: true });

	res.send(pins);
});

export default router;
