import { handleMessage, postHandleMessage, route } from "@fosscord/api";
import {
	Attachment,
	Channel,
	emitEvent,
	FosscordApiErrors,
	getPermission,
	getRights,
	HTTPError,
	Message,
	MessageCreateEvent,
	MessageCreateSchema,
	MessageDeleteEvent,
	MessageUpdateEvent,
	Snowflake,
	uploadFile
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import multer from "multer";

const router = Router();
// TODO: message content/embed string length limit

const messageUpload = multer({
	limits: {
		fileSize: 1024 * 1024 * 100,
		fields: 10,
		files: 1
	},
	storage: multer.memoryStorage()
}); // max upload 50 mb

router.patch(
	"/",
	route({ body: "MessageCreateSchema", permission: "SEND_MESSAGES", right: "SEND_MESSAGES" }),
	async (req: Request, res: Response) => {
		const { message_id, channel_id } = req.params;
		let body = req.body as MessageCreateSchema;

		const message = await Message.findOneOrFail({ where: { id: message_id, channel_id }, relations: ["attachments"] });

		const permissions = await getPermission(req.user_id, undefined, channel_id);

		const rights = await getRights(req.user_id);

		if (req.user_id !== message.author_id) {
			if (!rights.has("MANAGE_MESSAGES")) {
				permissions.hasThrow("MANAGE_MESSAGES");
				body = { flags: body.flags };
				// guild admins can only suppress embeds of other messages, no such restriction imposed to instance-wide admins
			}
		} else rights.hasThrow("SELF_EDIT_MESSAGES");

		const new_message = await handleMessage({
			...message,
			// TODO: should message_reference be overridable?
			// @ts-ignore
			message_reference: message.message_reference,
			...body,
			author_id: message.author_id,
			channel_id,
			id: message_id,
			edited_timestamp: new Date()
		});

		await Promise.all([
			new_message!.save(),
			await emitEvent({
				event: "MESSAGE_UPDATE",
				channel_id,
				data: { ...new_message, nonce: undefined }
			} as MessageUpdateEvent)
		]);

		postHandleMessage(message);

		return res.json(message);
	}
);

// Backfill message with specific timestamp
router.put(
	"/",
	messageUpload.single("file"),
	async (req, res, next) => {
		if (req.body.payload_json) {
			req.body = JSON.parse(req.body.payload_json);
		}

		next();
	},
	route({ body: "MessageCreateSchema", permission: "SEND_MESSAGES", right: "SEND_BACKDATED_EVENTS" }),
	async (req: Request, res: Response) => {
		const { channel_id, message_id } = req.params;
		let body = req.body as MessageCreateSchema;
		const attachments: Attachment[] = [];

		const rights = await getRights(req.user_id);
		rights.hasThrow("SEND_MESSAGES");

		// regex to check if message contains anything other than numerals ( also no decimals )
		if (!message_id.match(/^\+?\d+$/)) {
			throw new HTTPError("Message IDs must be positive integers", 400);
		}

		const snowflake = Snowflake.deconstruct(message_id);
		if (Date.now() < snowflake.timestamp) {
			// message is in the future
			throw FosscordApiErrors.CANNOT_BACKFILL_TO_THE_FUTURE;
		}

		const exists = await Message.findOne({ where: { id: message_id, channel_id: channel_id } });
		if (exists) {
			throw FosscordApiErrors.CANNOT_REPLACE_BY_BACKFILL;
		}

		if (req.file) {
			try {
				const file: any = await uploadFile(`/attachments/${req.params.channel_id}`, req.file);
				attachments.push({ ...file, proxy_url: file.url });
			} catch (error) {
				return res.status(400).json(error);
			}
		}
		const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients", "recipients.user"] });

		const embeds = body.embeds || [];
		if (body.embed) embeds.push(body.embed);
		let message = await handleMessage({
			...body,
			type: 0,
			pinned: false,
			author_id: req.user_id,
			id: message_id,
			embeds,
			channel_id,
			attachments,
			edited_timestamp: undefined,
			timestamp: new Date(snowflake.timestamp)
		});

		//Fix for the client bug
		delete message.member;

		await Promise.all([
			message.save(),
			emitEvent({ event: "MESSAGE_CREATE", channel_id: channel_id, data: message } as MessageCreateEvent),
			channel.save()
		]);

		postHandleMessage(message).catch((e) => {}); // no await as it shouldnt block the message send function and silently catch error

		return res.json(message);
	}
);

router.get("/", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;

	const message = await Message.findOneOrFail({ where: { id: message_id, channel_id }, relations: ["attachments"] });

	const permissions = await getPermission(req.user_id, undefined, channel_id);

	if (message.author_id !== req.user_id) permissions.hasThrow("READ_MESSAGE_HISTORY");

	return res.json(message);
});

router.delete("/", route({}), async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ where: { id: channel_id } });
	const message = await Message.findOneOrFail({ where: { id: message_id } });

	const rights = await getRights(req.user_id);

	if (message.author_id !== req.user_id) {
		if (!rights.has("MANAGE_MESSAGES")) {
			const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
			permission.hasThrow("MANAGE_MESSAGES");
		}
	} else rights.hasThrow("SELF_DELETE_MESSAGES");

	await Message.delete({ id: message_id });

	await emitEvent({
		event: "MESSAGE_DELETE",
		channel_id,
		data: {
			id: message_id,
			channel_id,
			guild_id: channel.guild_id
		}
	} as MessageDeleteEvent);

	res.sendStatus(204);
});

export default router;
