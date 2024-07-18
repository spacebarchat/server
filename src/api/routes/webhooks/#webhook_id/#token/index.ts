import { handleMessage, postHandleMessage, route } from "@spacebar/api";
import {
	Attachment,
	Config,
	DiscordApiErrors,
	FieldErrors,
	Message,
	MessageCreateEvent,
	Webhook,
	WebhookExecuteSchema,
	emitEvent,
	uploadFile,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import multer from "multer";
import { MoreThan } from "typeorm";
const router = Router();

router.get(
	"/",
	route({
		description: "Returns a webhook object for the given id.",
		responses: {
			200: {
				body: "APIWebhook",
			},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { webhook_id, token } = req.params;
		const webhook = await Webhook.findOne({
			where: {
				id: webhook_id,
			},
			relations: ["channel", "guild", "application"],
		});

		if (!webhook) {
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		}

		if (webhook.token !== token) {
			throw DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED;
		}

		return res.json(webhook);
	},
);

// TODO: config max upload size
const messageUpload = multer({
	limits: {
		fileSize: Config.get().limits.message.maxAttachmentSize,
		fields: 10,
		// files: 1
	},
	storage: multer.memoryStorage(),
}); // max upload 50 mb

// https://discord.com/developers/docs/resources/webhook#execute-webhook
router.post(
	"/",
	messageUpload.any(),
	(req, res, next) => {
		if (req.body.payload_json) {
			req.body = JSON.parse(req.body.payload_json);
		}

		next();
	},
	route({
		requestBody: "WebhookExecuteSchema",
		query: {
			wait: {
				type: "boolean",
				required: false,
				description:
					"waits for server confirmation of message send before response, and returns the created message body",
			},
			thread_id: {
				type: "string",
				required: false,
				description:
					"Send a message to the specified thread within a webhook's channel.",
			},
		},
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
			},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { wait } = req.query;
		if (!wait) return res.status(204).send();

		const { webhook_id, token } = req.params;

		const body = req.body as WebhookExecuteSchema;
		const attachments: Attachment[] = [];

		// ensure one of content, embeds, components, or file is present
		if (
			!body.content &&
			!body.embeds &&
			!body.components &&
			!body.file &&
			!body.attachments
		) {
			throw DiscordApiErrors.CANNOT_SEND_EMPTY_MESSAGE;
		}

		// block username from containing certain words
		// TODO: configurable additions
		const blockedContains = ["discord", "clyde", "spacebar"];
		for (const word of blockedContains) {
			if (body.username?.toLowerCase().includes(word)) {
				return res.status(400).json({
					username: [`Username cannot contain "${word}"`],
				});
			}
		}

		// block username from being certain words
		// TODO: configurable additions
		const blockedEquals = ["everyone", "here"];
		for (const word of blockedEquals) {
			if (body.username?.toLowerCase() === word) {
				return res.status(400).json({
					username: [`Username cannot be "${word}"`],
				});
			}
		}

		const webhook = await Webhook.findOne({
			where: {
				id: webhook_id,
			},
			relations: ["channel", "guild", "application"],
		});

		if (!webhook) {
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		}

		if (!webhook.channel.isWritable()) {
			throw new HTTPError(
				`Cannot send messages to channel of type ${webhook.channel.type}`,
				400,
			);
		}

		if (webhook.token !== token) {
			throw DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED;
		}

		// TODO: creating messages by users checks if the user can bypass rate limits, we cant do that on webhooks, but maybe we could check the application if there is one?
		const limits = Config.get().limits;
		if (limits.absoluteRate.register.enabled) {
			const count = await Message.count({
				where: {
					channel_id: webhook.channel_id,
					timestamp: MoreThan(
						new Date(
							Date.now() - limits.absoluteRate.sendMessage.window,
						),
					),
				},
			});

			if (count >= limits.absoluteRate.sendMessage.limit)
				throw FieldErrors({
					channel_id: {
						code: "TOO_MANY_MESSAGES",
						message: req.t("common:toomany.MESSAGE"),
					},
				});
		}

		const files = (req.files as Express.Multer.File[]) ?? [];
		for (const currFile of files) {
			try {
				const file = await uploadFile(
					`/attachments/${webhook.channel.id}`,
					currFile,
				);
				attachments.push(
					Attachment.create({ ...file, proxy_url: file.url }),
				);
			} catch (error) {
				return res.status(400).json({ message: error?.toString() });
			}
		}

		// TODO: set username and avatar based on body

		const embeds = body.embeds || [];
		const message = await handleMessage({
			...body,
			type: 0,
			pinned: false,
			webhook_id: webhook.id,
			application_id: webhook.application?.id,
			embeds,
			// TODO: Support thread_id/thread_name once threads are implemented
			channel_id: webhook.channel_id,
			attachments,
			timestamp: new Date(),
		});
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore dont care2
		message.edited_timestamp = null;

		webhook.channel.last_message_id = message.id;

		await Promise.all([
			message.save(),
			emitEvent({
				event: "MESSAGE_CREATE",
				channel_id: webhook.channel_id,
				data: message,
			} as MessageCreateEvent),
		]);

		// no await as it shouldnt block the message send function and silently catch error
		postHandleMessage(message).catch((e) =>
			console.error("[Message] post-message handler failed", e),
		);

		return res.json(message);
	},
);

export default router;
