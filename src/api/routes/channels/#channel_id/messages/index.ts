import { Router, Response, Request } from "express";
import {
	Attachment,
	Channel,
	ChannelType,
	Config,
	DmChannelDTO,
	emitEvent,
	getPermission,
	getRights,
	Message,
	MessageCreateEvent,
	Snowflake,
	uploadFile,
	Member,
	MessageCreateSchema,
	PluginEventHandler,
	PreMessageEventArgs
} from "@fosscord/util";
import { HTTPError } from "@fosscord/util";
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
		case ChannelType.GUILD_FORUM:
		case ChannelType.DIRECTORY:
			throw new HTTPError("not a text channel", 400);
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
		case ChannelType.GUILD_NEWS:
		case ChannelType.GUILD_NEWS_THREAD:
		case ChannelType.GUILD_PUBLIC_THREAD:
		case ChannelType.GUILD_PRIVATE_THREAD:
		case ChannelType.GUILD_TEXT:
		case ChannelType.ENCRYPTED:
		case ChannelType.ENCRYPTED_THREAD:
			return true;
		default:
			throw new HTTPError("unimplemented", 400);
	}
}

// https://discord.com/developers/docs/resources/channel#create-message
// get messages
router.get("/", async (req: Request, res: Response) => {
	const channel_id = req.params.channel_id;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id } });
	if (!channel) throw new HTTPError("Channel not found", 404);

	isTextChannel(channel.type);
	const around = req.query.around ? `${req.query.around}` : undefined;
	const before = req.query.before ? `${req.query.before}` : undefined;
	const after = req.query.after ? `${req.query.after}` : undefined;
	const limit = Number(req.query.limit) || 50;
	if (limit < 1 || limit > 100) throw new HTTPError("limit must be between 1 and 100", 422);

	let halfLimit = Math.floor(limit / 2);

	const permissions = await getPermission(req.user_id, channel.guild_id, channel_id);
	permissions.hasThrow("VIEW_CHANNEL");
	if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);

	let query: FindManyOptions<Message> & { where: { id?: any; }; } = {
		order: { id: "DESC" },
		take: limit,
		where: { channel_id },
		relations: ["author", "webhook", "application", "mentions", "mention_roles", "mention_channels", "sticker_items", "attachments"]
	};
	

	if (after) {
		if (after > new Snowflake()) return res.status(422);
		query.where.id = MoreThan(after);
	}
	else if (before) { 
		if (before < req.params.channel_id) return res.status(422);
		query.where.id = LessThan(before);
	}
	else if (around) {
		query.where.id = [
			MoreThan((BigInt(around) - BigInt(halfLimit)).toString()),
			LessThan((BigInt(around) + BigInt(halfLimit)).toString())
		];
	}

	const messages = await Message.find(query);
	const endpoint = Config.get().cdn.endpointPublic;

	return res.json(
		messages.map((x: any) => {
			(x.reactions || []).forEach((x: any) => {
				// @ts-ignore
				if ((x.user_ids || []).includes(req.user_id)) x.me = true;
				// @ts-ignore
				delete x.user_ids;
			});
			// @ts-ignore
			if (!x.author) x.author = { id: "4", discriminator: "0000", username: "Fosscord Ghost", public_flags: "0", avatar: null };
			x.attachments?.forEach((y: any) => {
				// dynamically set attachment proxy_url in case the endpoint changed
				const uri = y.proxy_url.startsWith("http") ? y.proxy_url : `https://example.org${y.proxy_url}`;
				y.proxy_url = `${endpoint == null ? "" : endpoint}${new URL(uri).pathname}`;
			});
			
			/**
			Some clients ( discord.js ) only check if a property exists within the response,
			which causes erorrs when, say, the `application` property is `null`.
			**/
			
			for (let curr in x) {
				if (x[curr] === null)
					delete x[curr];
			}

			return x;
		})
	);
});

// TODO: config max upload size
const messageUpload = multer({
	limits: {
		fileSize: 1024 * 1024 * 100,
		fields: 10,
		// files: 1
	},
	storage: multer.memoryStorage()
}); // max upload 50 mb
/**
 TODO: dynamically change limit of MessageCreateSchema with config

 https://discord.com/developers/docs/resources/channel#create-message
 TODO: text channel slowdown (per-user and across-users)
 Q: trim and replace message content and every embed field A: NO, given this cannot be implemented in E2EE channels
 TODO: only dispatch notifications for mentions denoted in allowed_mentions
**/
// Send message
router.post(
	"/",
	messageUpload.any(),
	async (req, res, next) => {
		if (req.body.payload_json) {
			req.body = JSON.parse(req.body.payload_json);
		}

		next();
	},
	route({ body: "MessageCreateSchema", permission: "SEND_MESSAGES", right: "SEND_MESSAGES" }),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;
		let body = req.body as MessageCreateSchema;
		const attachments: Attachment[] = [];

		const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients", "recipients.user"] });
		if (!channel.isWritable()) {
			throw new HTTPError(`Cannot send messages to channel of type ${channel.type}`, 400)
		}

		const files = req.files as Express.Multer.File[] ?? [];
		for (let currFile of files) {
			try {
				const file: any = await uploadFile(`/attachments/${channel.id}`, currFile);
				attachments.push({ ...file, proxy_url: file.url });
			}
			catch (error) {
				return res.status(400).json(error);
			}
		}

		const embeds = body.embeds || [];
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
	
	    //Defining member fields
		var member = await Member.findOneOrFail({ where: { id: req.user_id }, relations: ["roles", "user"] });
		// TODO: This doesn't work either
        // member.roles = member.roles.filter((role) => {
		// 	return role.id !== role.guild_id;
		// }).map((role) => {
		// 	return role.id;
		// });
		message.member = member;
		// TODO: Figure this out
		// delete message.member.last_message_id;
		// delete message.member.index;

		let blocks = (await PluginEventHandler.preMessageEvent({
			message
		} as PreMessageEventArgs)).filter(x=>x.cancel);
		if(blocks.length > 0) throw new HTTPError("Message denied.", 400, blocks.filter(x=>x.blockReason).map(x=>x.blockReason));

		await Promise.all([
			message.save(),
			emitEvent({ event: "MESSAGE_CREATE", channel_id: channel_id, data: message } as MessageCreateEvent),
			message.guild_id ? Member.update({ id: req.user_id, guild_id: message.guild_id }, { last_message_id: message.id }) : null,
			channel.save()
		]);

		postHandleMessage(message).catch((e) => { }); // no await as it shouldnt block the message send function and silently catch error

		return res.json(message);
	}
);

