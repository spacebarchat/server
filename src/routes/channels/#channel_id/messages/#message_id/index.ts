import { ChannelModel, getPermission, MessageModel } from "@fosscord/server-util";
import { Router } from "express";
import { HTTPError } from "lambert-server";
import { check } from "../../../../../util/instanceOf";

const router = Router();
// TODO:

router.delete("/", async (req, res) => {
	const { message_id, channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true });
	if (!channel) throw new HTTPError("Channel doesn't exist", 404);

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
	permission.hasThrow("MANAGE_MESSAGES");

	await MessageModel.deleteOne({ id: message_id }).exec();

	res.sendStatus(204);
});

export default router;
