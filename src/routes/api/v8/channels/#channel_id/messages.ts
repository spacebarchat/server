import { Router } from "express";
import { ChannelModel, ChannelType, getPermission, MessageModel } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { instanceOf, Length } from "../../../../../util/instanceOf";
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
	switch (type) {
		case ChannelType.GUILD_VOICE:
		case ChannelType.GUILD_CATEGORY:
			throw new HTTPError("not a text channel", 400);
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
		case ChannelType.GUILD_NEWS:
		case ChannelType.GUILD_STORE:
		case ChannelType.GUILD_TEXT:
			break;
	}

	instanceOf({ $around: BigInt, $after: BigInt, $before: BigInt, $limit: new Length(Number, 1, 100) }, req.query, {
		path: "query",
		req,
	});

	if (channel.guild_id) {
		const permissions = await getPermission(req.userid, channel.guild_id, channel_id, { channel });
		if (!permissions.has("VIEW_CHANNEL"))
			throw new HTTPError("You don't have permission to view this channel", 401);
		if (permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);
	} else if (channel.recipients) {
		// group/dm channel
		if (!channel.recipients.includes(req.userid))
			throw new HTTPError("You don't have permission to view this channel", 401);
	} else {
		// idk what this channel is, can probably be removed
		throw new HTTPError("Unkown channel type", 500);
	}
});
