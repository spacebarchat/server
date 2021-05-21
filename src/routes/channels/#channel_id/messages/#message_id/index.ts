import { ChannelModel, getPermission, MessageDeleteEvent, MessageModel } from "@fosscord/server-util";
import { Router } from "express";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../../../util/Event";
import { check } from "../../../../../util/instanceOf";

const router = Router();
// TODO:

router.delete("/", async (req, res) => {
	const { message_id, channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true });
	if (!channel) throw new HTTPError("Channel not found", 404);
	const message = await MessageModel.findOne({ id: message_id }, { author_id: true }).exec();
	if (!message) throw new HTTPError("Message not found", 404);

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	if (message.author_id !== req.user_id) permission.hasThrow("MANAGE_MESSAGES");

	await MessageModel.deleteOne({ id: message_id }).exec();

	await emitEvent({
		event: "MESSAGE_DELETE",
		channel_id,
		guild_id: channel.guild_id,
		data: {
			id: message_id,
			channel_id,
			guild_id: channel.guild_id
		}
	} as MessageDeleteEvent);

	res.sendStatus(204);
});

export default router;
