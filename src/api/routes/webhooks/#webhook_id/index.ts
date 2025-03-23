import { route } from "@spacebar/api";
import {
	Config,
	DiscordApiErrors,
	getPermission,
	Webhook,
	WebhooksUpdateEvent,
	emitEvent,
	WebhookUpdateSchema,
	Channel,
	handleFile,
	FieldErrors,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.get(
	"/",
	route({
		description:
			"Returns a webhook object for the given id. Requires the MANAGE_WEBHOOKS permission or to be the owner of the webhook.",
		responses: {
			200: {
				body: "APIWebhook",
			},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { webhook_id } = req.params;
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

		if (webhook.guild_id) {
			const permission = await getPermission(
				req.user_id,
				webhook.guild_id,
			);

			if (!permission.has("MANAGE_WEBHOOKS"))
				throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		} else if (webhook.user_id != req.user_id)
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;

		const instanceUrl =
			Config.get().api.endpointPublic || "http://localhost:3001";
		return res.json({
			...webhook,
			url: instanceUrl + "/webhooks/" + webhook.id + "/" + webhook.token,
		});
	},
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
		const { webhook_id } = req.params;

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

		if (webhook.guild_id) {
			const permission = await getPermission(
				req.user_id,
				webhook.guild_id,
			);

			if (!permission.has("MANAGE_WEBHOOKS"))
				throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		} else if (webhook.user_id != req.user_id)
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;

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
				body: "WebhookCreateResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { webhook_id } = req.params;
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

		if (webhook.guild_id) {
			const permission = await getPermission(
				req.user_id,
				webhook.guild_id,
			);

			if (!permission.has("MANAGE_WEBHOOKS"))
				throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		} else if (webhook.user_id != req.user_id)
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;

		if (!body.name && !body.avatar && !body.channel_id) {
			throw new HTTPError("Empty messages are not allowed", 50006);
		}

		if (body.avatar)
			body.avatar = await handleFile(
				`/avatars/${webhook_id}`,
				body.avatar as string,
			);

		if (body.name) {
			const check_username = body.name.replace(/\s/g, "");
			if (!check_username) {
				throw FieldErrors({
					username: {
						code: "BASE_TYPE_REQUIRED",
						message: req.t("common:field.BASE_TYPE_REQUIRED"),
					},
				});
			}

			const { maxUsername } = Config.get().limits.user;
			if (
				check_username.length > maxUsername ||
				check_username.length < 2
			) {
				throw FieldErrors({
					username: {
						code: "BASE_TYPE_BAD_LENGTH",
						message: `Must be between 2 and ${maxUsername} in length.`,
					},
				});
			}

			const blockedContains = ["discord", "clyde", "spacebar"];
			for (const word of blockedContains) {
				if (body.name.toLowerCase().includes(word)) {
					return res.status(400).json({
						username: [`Username cannot contain "${word}"`],
					});
				}
			}
		}

		const channel_id = body.channel_id || webhook.channel_id;
		webhook.assign(body);

		if (body.channel_id)
			webhook.assign({
				channel: await Channel.findOneOrFail({
					where: { id: channel_id },
				}),
			});
		console.log(webhook.channel_id);

		await webhook.save();
		await emitEvent({
			event: "WEBHOOKS_UPDATE",
			channel_id,
			data: {
				channel_id,
				guild_id: webhook.guild_id,
			},
		} as WebhooksUpdateEvent);

		console.log(webhook.channel_id);
		res.json(webhook);
	},
);

export default router;
