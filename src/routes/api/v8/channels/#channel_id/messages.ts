import { Router } from "express";
import { ChannelModel, ChannelType, getPermission, MessageModel } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
const router: Router = Router();

export default router;

router.get("/", async (req, res) => {
	const channel_id = BigInt(req.params.channel_id);
	const channel = await ChannelModel.findOne(
		{ id: channel_id },
		{ guild_id: true, type: true, permission_overwrites: true }
	).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);

	const type: ChannelType = channel.type;

	getPermission(req.userid, channel.guild_id, channel_id);

	if (channel.guild_id) {
		channel.permission_overwrites;
	} else if (channel.recipients) {
		// group/dm channel
	} else {
		// idk what this channel is, can probably be removed
	}
});
