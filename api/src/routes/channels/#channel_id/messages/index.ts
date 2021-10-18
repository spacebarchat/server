import { Router, Response, Request } from "express";
import {
	Attachment,
	Channel,
	ChannelType,
	Config,
	DmChannelDTO,
	Embed,
	emitEvent,
	getPermission,
	Message,
	MessageCreateEvent,
	uploadFile,
	Member
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { handleMessage, postHandleMessage, route } from "@fosscord/api";
import multer from "multer";
import { FindManyOptions, LessThan, MoreThan } from "typeorm";
import { URL } from "url";

const router: Router = Router();

export default router;

export function isTextChannel(type: ChannelType): boolean {
	switch (type) {
		case ChannelType.GUILD_STORE:
		case ChannelType.GUILD_VOICE:
		case ChannelType.GUILD_STAGE_VOICE:
		case ChannelType.GUILD_CATEGORY:
			throw new HTTPError("not a text channel", 400);
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
		case ChannelType.GUILD_NEWS:
		case ChannelType.GUILD_NEWS_THREAD:
		case ChannelType.GUILD_PUBLIC_THREAD:
		case ChannelType.GUILD_PRIVATE_THREAD:
		case ChannelType.GUILD_TEXT:
			return true;
	}
}

export interface MessageCreateSchema {
	content?: string;
	nonce?: string;
	tts?: boolean;
	flags?: string;
	embeds?: Embed[];
	embed?: Embed;
	// TODO: ^ embed is deprecated in favor of embeds (https://discord.com/developers/docs/resources/channel#message-object)
	allowed_mentions?: {
		parse?: string[];
		roles?: string[];
		users?: string[];
		replied_user?: boolean;
	};
	message_reference?: {
		message_id: string;
		channel_id: string;
		guild_id?: string;
		fail_if_not_exists?: boolean;
	};
	payload_json?: string;
	file?: any;
	attachments?: any[]; //TODO we should create an interface for attachments
	sticker_ids?: string[];
}

// https://discord.com/developers/docs/resources/channel#create-message
// get messages
router.get("/", async (req: Request, res: Response) => {
	const channel_id = req.params.channel_id;
	const channel = await Channel.findOneOrFail({ id: channel_id });
	if (!channel) throw new HTTPError("Channel not found", 404);

	isTextChannel(channel.type);
	const around = req.query.around ? `${req.query.around}` : undefined;
	const before = req.query.before ? `${req.query.before}` : undefined;
	const after = req.query.after ? `${req.query.after}` : undefined;
	const limit = Number(req.query.limit) || 50;
	if (limit < 1 || limit > 100) throw new HTTPError("limit must be between 1 and 100");

	var halfLimit = Math.floor(limit / 2);

	const permissions = await getPermission(req.user_id, channel.guild_id, channel_id);
	permissions.hasThrow("VIEW_CHANNEL");
	if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);

	var query: FindManyOptions<Message> & { where: { id?: any } } = {
		order: { id: "DESC" },
		take: limit,
		where: { channel_id },
		relations: ["author", "webhook", "application", "mentions", "mention_roles", "mention_channels", "sticker_items", "attachments"]
	};

	if (after) query.where.id = MoreThan(after);
	else if (before) query.where.id = LessThan(before);
	else if (around) {
		query.where.id = [
			MoreThan((BigInt(around) - BigInt(halfLimit)).toString()),
			LessThan((BigInt(around) + BigInt(halfLimit)).toString())
		];
	}

	const messages = await Message.find(query);
	const endpoint = Config.get().cdn.endpointPublic;

	return res.json(
		messages.map((x) => {
			(x.reactions || []).forEach((x: any) => {
				// @ts-ignore
				if ((x.user_ids || []).includes(req.user_id)) x.me = true;
				// @ts-ignore
				delete x.user_ids;
			});
			// @ts-ignore
			if (!x.author) x.author = { discriminator: "0000", username: "Deleted User", public_flags: "0", avatar: null };
			x.attachments?.forEach((x) => {
				// dynamically set attachment proxy_url in case the endpoint changed
				const uri = x.proxy_url.startsWith("http") ? x.proxy_url : `https://example.org${x.proxy_url}`;
				x.proxy_url = `${endpoint == null ? "" : endpoint}${new URL(uri).pathname}`;
			});

			return x;
		})
	);
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
router.post(
	"/",
	messageUpload.single("file"),
	async (req, res, next) => {
		if (req.body.payload_json) {
			req.body = JSON.parse(req.body.payload_json);
		}

		next();
	},
	route({ body: "MessageCreateSchema", permission: "SEND_MESSAGES" }),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;
		var body = req.body as MessageCreateSchema;
		const attachments: Attachment[] = [];

		if (req.file) {
			try {
				const file = await uploadFile(`/attachments/${req.params.channel_id}`, req.file);
				attachments.push({ ...file, proxy_url: file.url });
			} catch (error) {
				return res.status(400).json(error);
			}
		}
		const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients", "recipients.user"] });

		const embeds = [];
		if (body.embed) embeds.push(body.embed);
		let message = await handleMessage({
			...body,
			type: 0,
			pinned: false,
			author_id: req.user_id,
			embeds,
			channel_id,
			attachments,
			edited_timestamp: undefined,
			timestamp: new Date()
		});

		channel.last_message_id = message.id;

		if (channel.isDm()) {
			const channel_dto = await DmChannelDTO.from(channel);

			// Only one recipients should be closed here, since in group DMs the recipient is deleted not closed
			Promise.all(
				channel.recipients!.map((recipient) => {
					if (recipient.closed) {
						recipient.closed = false;
						return Promise.all([
							recipient.save(),
							emitEvent({
								event: "CHANNEL_CREATE",
								data: channel_dto.excludedRecipients([recipient.user_id]),
								user_id: recipient.user_id
							})
						]);
					}
				})
			);
		}

		await Promise.all([
			message.save(),
			emitEvent({ event: "MESSAGE_CREATE", channel_id: channel_id, data: message } as MessageCreateEvent),
			message.guild_id ? Member.update({ id: req.user_id, guild_id: message.guild_id }, { last_message_id: message.id }) : null,
			channel.save()
		]);

		postHandleMessage(message).catch((e) => {}); // no await as it shouldnt block the message send function and silently catch error

		return res.json(message);
	}
);
