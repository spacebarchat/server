import { Router, Response, Request } from "express";
import { Attachment, Channel, ChannelType, getPermission, Message } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { MessageCreateSchema } from "../../../../schema/Message";
import { check, instanceOf, Length } from "../../../../util/instanceOf";
import multer from "multer";
import { Query } from "mongoose";
import { sendMessage } from "../../../../util/Message";
import { uploadFile } from "../../../../util/cdn";
import { FindManyOptions, LessThan, MoreThan } from "typeorm";

const router: Router = Router();

export default router;

export function isTextChannel(type: ChannelType): boolean {
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
router.get("/", async (req: Request, res: Response) => {
	const channel_id = req.params.channel_id;
	const channel = await Channel.findOneOrFail(
		{ id: channel_id },
		{ select: ["guild_id", "type", "permission_overwrites", "recipient_ids", "owner_id"] }
	); // lean is needed, because we don't want to populate .recipients that also auto deletes .recipient_ids
	if (!channel) throw new HTTPError("Channel not found", 404);

	isTextChannel(channel.type);

	try {
		instanceOf({ $around: String, $after: String, $before: String, $limit: new Length(Number, 1, 100) }, req.query, {
			path: "query",
			req
		});
	} catch (error) {
		return res.status(400).json({ code: 50035, message: "Invalid Query", success: false, errors: error });
	}
	var { around, after, before, limit }: { around?: string; after?: string; before?: string; limit?: number } = req.query;
	if (!limit) limit = 50;
	var halfLimit = Math.floor(limit / 2);

	// @ts-ignore
	const permissions = await getPermission(req.user_id, channel.guild_id, channel_id, { channel });
	permissions.hasThrow("VIEW_CHANNEL");
	if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);

	var query: FindManyOptions<Message> & { where: { id?: any } } = { order: { id: "DESC" }, take: limit, where: { channel_id } };

	if (after) query.where.id = MoreThan(after);
	else if (before) query.where.id = LessThan(before);
	else if (around) {
		query.where.id = [
			MoreThan((BigInt(around) - BigInt(halfLimit)).toString()),
			LessThan((BigInt(around) + BigInt(halfLimit)).toString())
		];
	}

	const messages = await Message.find(query);

	return res.json(messages).map((x) => {
		(x.reactions || []).forEach((x: any) => {
			// @ts-ignore
			if ((x.user_ids || []).includes(req.user_id)) x.me = true;
			// @ts-ignore
			delete x.user_ids;
		});
		// @ts-ignore
		if (!x.author) x.author = { discriminator: "0000", username: "Deleted User", public_flags: 0n, avatar: null };

		return x;
	});
});

// TODO: config max upload size
const messageUpload = multer({
	limits: {
		fileSize: 1024 * 1024 * 100,
		fields: 10,
		files: 1
	},
	storage: multer.memoryStorage()
}); // max upload 50 mb

// TODO: dynamically change limit of MessageCreateSchema with config
// TODO: check: sum of all characters in an embed structure must not exceed 6000 characters

// https://discord.com/developers/docs/resources/channel#create-message
// TODO: text channel slowdown
// TODO: trim and replace message content and every embed field
// TODO: check allowed_mentions

// Send message
router.post("/", messageUpload.single("file"), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	var body = req.body as MessageCreateSchema;
	const attachments: Attachment[] = [];

	if (req.file) {
		try {
			const file = await uploadFile(`/attachments/${channel_id}`, req.file);
			attachments.push({ ...file, proxy_url: file.url });
		} catch (error) {
			return res.status(400).json(error);
		}
	}

	if (body.payload_json) {
		body = JSON.parse(body.payload_json);
	}

	const errors = instanceOf(MessageCreateSchema, body, { req });
	if (errors !== true) throw errors;

	const embeds = [];
	if (body.embed) embeds.push(body.embed);
	const data = await sendMessage({
		...body,
		type: 0,
		pinned: false,
		author_id: req.user_id,
		embeds,
		channel_id,
		attachments,
		edited_timestamp: undefined
	});

	return res.send(data);
});
