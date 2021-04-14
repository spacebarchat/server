import { Router } from "express";
import {
	ChannelModel,
	ChannelType,
	getPermission,
	Message,
	MessageCreateEvent,
	MessageDocument,
	MessageModel,
	Snowflake,
	toObject,
} from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { MessageCreateSchema } from "../../../../schema/Message";
import { check, instanceOf, Length } from "../../../../util/instanceOf";
import { PublicUserProjection } from "../../../../util/User";
import multer from "multer";
import { emitEvent } from "../../../../util/Event";
import { Query } from "mongoose";
import { PublicMemberProjection } from "../../../../util/Member";
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

// https://discord.com/developers/docs/resources/channel#create-message
// get messages
router.get("/", async (req, res) => {
	const channel_id = req.params.channel_id;
	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true, type: true, permission_overwrites: true }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);

	isTextChannel(channel.type);

	try {
		instanceOf({ $around: String, $after: String, $before: String, $limit: new Length(Number, 1, 100) }, req.query, {
			path: "query",
			req,
		});
	} catch (error) {
		return res.status(400).json({ code: 50035, message: "Invalid Query", success: false, errors: error });
	}
	var { around, after, before, limit }: { around?: string; after?: string; before?: string; limit?: number } = req.query;
	if (!limit) limit = 50;
	var halfLimit = Math.floor(limit / 2);

	if ([ChannelType.GUILD_VOICE, ChannelType.GUILD_CATEGORY, ChannelType.GUILD_STORE].includes(channel.type))
		throw new HTTPError("Not a text channel");

	if (channel.guild_id) {
		const permissions = await getPermission(req.user_id, channel.guild_id, channel_id, { channel });
		if (!permissions.has("VIEW_CHANNEL")) throw new HTTPError("You don't have permission to view this channel", 401);
		if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);
	} else if (channel.recipients) {
		// group/dm channel
		if (!channel.recipients.includes(req.user_id)) throw new HTTPError("You don't have permission to view this channel", 401);
	}

	var query: Query<MessageDocument[], MessageDocument, {}>;
	if (after) query = MessageModel.find({ channel_id, id: { $gt: after } });
	else if (before) query = MessageModel.find({ channel_id, id: { $lt: before } });
	else if (around)
		query = MessageModel.find({
			channel_id,
			id: { $gt: (BigInt(around) - BigInt(halfLimit)).toString(), $lt: (BigInt(around) + BigInt(halfLimit)).toString() },
		});
	else {
		query = MessageModel.find({ channel_id }).sort({ id: -1 });
	}

	const messages = await query.limit(limit).exec();

	return res.json(toObject(messages));
});

// TODO: config max upload size
const messageUpload = multer({ limits: { fieldSize: 1024 * 1024 * 1024 * 50 } }); // max upload 50 mb

// TODO: dynamically change limit of MessageCreateSchema with config
// TODO: check: sum of all characters in an embed structure must not exceed 6000 characters

// https://discord.com/developers/docs/resources/channel#create-message
// TODO: text channel slowdown
// TODO: trim and replace message content and every embed field
// Send message
router.post("/", check(MessageCreateSchema), async (req, res) => {
	const channel_id = req.params.channel_id;
	const body = req.body as MessageCreateSchema;

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true, type: true, permission_overwrites: true }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);
	// TODO: are tts messages allowed in dm channels? should permission be checked?

	if (channel.guild_id) {
		const permissions = await getPermission(req.user_id, channel.guild_id, channel_id, { channel });
		if (!permissions.has("SEND_MESSAGES")) throw new HTTPError("You don't have the SEND_MESSAGES permission");
		if (body.tts && !permissions.has("SEND_TTS_MESSAGES")) throw new HTTPError("You are missing the SEND_TTS_MESSAGES permission");
		if (body.message_reference) {
			if (!permissions.has("READ_MESSAGE_HISTORY"))
				throw new HTTPError("You are missing the READ_MESSAGE_HISTORY permission to reply");
			if (body.message_reference.guild_id !== channel.guild_id)
				throw new HTTPError("You can only reference messages from this guild");
		}
	}

	if (body.message_reference) {
		if (body.message_reference.channel_id !== channel_id) throw new HTTPError("You can only reference messages from this channel");
		// TODO: should be checked if the referenced message exists?
	}

	const embeds = [];
	if (body.embed) embeds.push(body.embed);

	// TODO: check and put all in body in it
	const message: Message = {
		id: Snowflake.generate(),
		channel_id,
		guild_id: channel.guild_id,
		author_id: req.user_id,
		content: body.content,
		timestamp: new Date(),
		mention_channels_ids: [],
		mention_role_ids: [],
		mention_user_ids: [],
		attachments: [],
		embeds: [],
		reactions: [],
		type: 0,
		tts: body.tts,
		nonce: body.nonce,
		pinned: false,
	};

	const doc = await new MessageModel(message).populate({ path: "member", select: PublicMemberProjection }).save();
	const data = toObject(doc);

	await emitEvent({ event: "MESSAGE_CREATE", channel_id, data, guild_id: channel.guild_id } as MessageCreateEvent);

	return res.send(data);
});
