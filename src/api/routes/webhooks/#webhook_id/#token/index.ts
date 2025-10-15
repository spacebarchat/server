import { route } from "@spacebar/api";
import {
	Config,
	DiscordApiErrors,
	emitEvent,
	handleFile,
	ValidateName,
	Webhook,
	WebhooksUpdateEvent,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import multer from "multer";
import { executeWebhook } from "../../../../util/handlers/Webhook";
import { WebhookUpdateSchema } from "@spacebar/schemas"
const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		description: "Returns a webhook object for the given id and token.",
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
			relations: [
				"user",
				"channel",
				"source_channel",
				"guild",
				"source_guild",
				"application",
			],
		});

		if (!webhook) {
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		}

		if (webhook.token !== token) {
			throw DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED;
		}

		const instanceUrl =
			Config.get().api.endpointPublic || "http://localhost:3001";
		return res.json({
			...webhook,
			url: instanceUrl + "/webhooks/" + webhook.id + "/" + webhook.token,
		});
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
// TODO: Slack compatible hooks
router.post(
	"/",
	messageUpload.any(),
	(req, _res, next) => {
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
	executeWebhook,
);

router.delete(
	"/",
	route({
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
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
		const channel_id = webhook.channel_id;
		await Webhook.delete({ id: webhook_id });

		await emitEvent({
			event: "WEBHOOKS_UPDATE",
			channel_id,
			data: {
				channel_id,
				guild_id: webhook.guild_id,
			},
		} as WebhooksUpdateEvent);

		res.sendStatus(204);
	},
);

router.patch(
	"/",
	route({
		requestBody: "WebhookUpdateSchema",
		responses: {
			200: {
				body: "Message",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { webhook_id, token } = req.params;
		const body = req.body as WebhookUpdateSchema;

		const webhook = await Webhook.findOneOrFail({
			where: { id: webhook_id },
			relations: [
				"user",
				"channel",
				"source_channel",
				"guild",
				"source_guild",
				"application",
			],
		});
		const channel_id = webhook.channel_id;
		if (!body.name && !body.avatar) {
			throw new HTTPError("Empty webhook updates are not allowed", 50006);
		}
		if (body.avatar)
			body.avatar = await handleFile(
				`/avatars/${webhook_id}`,
				body.avatar as string,
			);

		if (body.name) {
			ValidateName(body.name);
		}

		webhook.assign(body);

		await Promise.all([
			webhook.save(),
			emitEvent({
				event: "WEBHOOKS_UPDATE",
				channel_id,
				data: {
					channel_id,
					guild_id: webhook.guild_id,
				},
			} as WebhooksUpdateEvent),
		]);
		res.status(204);
	},
);

export default router;
