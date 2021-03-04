import { Router } from "express";
import { ChannelModel, ChannelType, getPermission, MessageModel } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check, instanceOf, Length } from "../../../../../../util/instanceOf";
import { PublicUserProjection } from "../../../../../../util/User";
const router: Router = Router();

export default router;

function isTextChannel(type: ChannelType): boolean {
	switch (type) {
		case ChannelType.GUILD_VOICE:
		case ChannelType.GUILD_CATEGORY:
			throw new HTTPError("not a text channel", 400);
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
		case ChannelType.GUILD_NEWS:
		case ChannelType.GUILD_STORE:
		case ChannelType.GUILD_TEXT:
			return true;
	}
}

router.get("/", async (req, res) => {
	const channel_id = BigInt(req.params.channel_id);
	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true, type: true, permission_overwrites: true }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);

	isTextChannel(channel.type);

	try {
		instanceOf({ $around: BigInt, $after: BigInt, $before: BigInt, $limit: new Length(Number, 1, 100) }, req.query, {
			path: "query",
			req,
		});
	} catch (error) {
		return res.status(400).json({ code: 50035, message: "Invalid Query", success: false, errors: error });
	}
	var { around, after, before, limit }: { around?: bigint; after?: bigint; before?: bigint; limit?: number } = req.query;
	if (!limit) limit = 50;
	var halfLimit = BigInt(Math.floor(limit / 2));

	if ([ChannelType.GUILD_VOICE, ChannelType.GUILD_CATEGORY, ChannelType.GUILD_STORE].includes(channel.type))
		throw new HTTPError("Not a text channel");

	if (channel.guild_id) {
		const permissions = await getPermission(req.userid, channel.guild_id, channel_id, { channel });
		if (!permissions.has("VIEW_CHANNEL")) throw new HTTPError("You don't have permission to view this channel", 401);
		if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);
	} else if (channel.recipients) {
		// group/dm channel
		if (!channel.recipients.includes(req.userid)) throw new HTTPError("You don't have permission to view this channel", 401);
	}

	var query: any;
	if (after) query = MessageModel.find({ channel_id, id: { $gt: after } });
	else if (before) query = MessageModel.find({ channel_id, id: { $lt: before } });
	else if (around) query = MessageModel.find({ channel_id, id: { $gt: around - halfLimit, $lt: around + halfLimit } });
	else {
		query = MessageModel.find({ channel_id }).sort({ id: -1 });
	}

	const messages = await query
		.limit(limit)
		.populate({ path: "author", select: PublicUserProjection })
		.populate({ path: "mentions", select: PublicUserProjection })
		.populate({ path: "mention_channels", select: { id: true, guild_id: true, type: true, name: true } })
		.populate("mention_roles")
		// .populate({ path: "member", select: PublicMemberProjection })
		.exec();

	return res.json(messages);
});

router.post("/", check(), async (req, res) => {
	const channel_id = BigInt(req.params.channel_id);

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true, type: true, permission_overwrites: true }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);

	if (channel.guild_id) {
		const permissions = await getPermission(req.userid, channel.guild_id, channel_id, { channel });
		if (!permissions.has("SEND_MESSAGES")) throw new HTTPError("You don't have the SEND_MESSAGES permission");
	}
});
