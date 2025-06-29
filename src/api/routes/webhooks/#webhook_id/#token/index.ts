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
	WebhooksUpdateEvent,
	WebhookUpdateSchema,
	handleFile,
	ValidateName,
	EmbedType,
	capitalize,
} from "@spacebar/util";
import { NextFunction, Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import multer from "multer";
import { MoreThan } from "typeorm";
const router = Router();

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

const executeWebhook = async (req: Request, res: Response) => {
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
	if (body.username) {
		ValidateName(body.username);
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

	const embeds = body.embeds || [];
	const message = await handleMessage({
		...body,
		username: body.username || webhook.name,
		avatar_url: body.avatar_url || webhook.avatar,
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
		webhook.channel.save(),
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
};

const parseGitHubWebhook = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const eventType = req.headers["x-github-event"] as string;
	if (!eventType) {
		throw new HTTPError("Missing X-GitHub-Event header", 400);
	}

	if (eventType === "ping") {
		return res.status(200).json({ message: "pong" });
	}

	const discordPayload = transformGitHubToDiscord(eventType, req.body);
	if (!discordPayload) {
		// Unsupported event type
		return res.status(204).send();
	}

	req.body = discordPayload;
	console.dir(req.body, { depth: null });
	// Set default wait=true for GitHub webhooks so they get a response
	req.query.wait = req.query.wait || "true";
	next();
};

function transformGitHubToDiscord(
	eventType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: any,
): WebhookExecuteSchema | null {
	switch (eventType) {
		case "star":
			return {
				username: "GitHub",
				// TODO: Provide a static avatar for GitHub
				embeds: [
					{
						title: `⭐ New star on ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: `${payload.sender?.login} starred the repository`,
						color: 0xffd700,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "commit_comment":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `💬 Comment on Commit ${payload.comment?.commit_id} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.comment?.body || "No comment",
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "create":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `➕ ${capitalize(payload.ref_type)} created in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: `A new ${payload.ref_type} named \`${payload.ref}\` was created`,
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "delete":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `🗑️ ${payload.ref_type} deleted in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: `The ${payload.ref_type} named \`${payload.ref}\` was deleted`,
						color: 0xf04747,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "fork":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `🍴 Repository forked: ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: `${payload.sender?.login} forked the repository`,
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "issue_comment":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `💬 Comment on Issue #${payload.issue?.number} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.comment?.body || "No comment",
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "issues":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `📝 Issue ${payload.action} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.issue?.title,
						color:
							payload.issue?.state === "open"
								? 0x43b581
								: 0xf04747,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "member":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `👤 Member ${payload.action} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: `${payload.member?.login} was ${payload.action} to the repository`,
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "public":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `🌐 Repository ${payload.repository?.full_name} is now public`,
						type: EmbedType.rich,
						description: `${payload.repository?.full_name} is now public`,
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "pull_request":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `🔀 Pull Request ${payload.action} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.pull_request?.title,
						color:
							payload.pull_request?.state === "open"
								? 0x43b581
								: 0xf04747,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "pull_request_review":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `📝 Pull Request Review ${payload.action} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.review?.body || "No review body",
						color:
							payload.review?.state === "approved"
								? 0x43b581
								: payload.review?.state === "changes_requested"
									? 0xf04747
									: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "pull_request_review_comment":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `💬 Comment on Pull Request #${payload.pull_request?.number} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.comment?.body || "No comment",
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "push": {
			const commits = payload.commits?.slice(0, 5) || [];
			if (commits.length === 0) {
				return null;
			}
			return {
				username: "GitHub",
				embeds: [
					{
						title: `📤 Push to ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: `${commits.length} commit${commits.length !== 1 ? "s" : ""} to \`${payload.ref?.replace("refs/heads/", "")}\``,
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						// TODO: Improve this by adding fields for recent commits
						timestamp: new Date().toISOString(),
					},
				],
			};
		}
		case "release":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `🚀 Release ${payload.release?.tag_name} ${payload.action} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.release?.name || "No title",
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "watch":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `👀 ${payload.repository?.full_name} is now watched`,
						type: EmbedType.rich,
						description: `${payload.sender?.login} started watching the repository`,
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "check_run":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `✅ Check Run ${payload.check_run?.name} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description:
							payload.check_run?.output?.title || "No title",
						color:
							payload.check_run?.conclusion === "success"
								? 0x43b581
								: payload.check_run?.conclusion === "failure"
									? 0xf04747
									: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "check_suite":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `✅ Check Suite ${payload.check_suite?.status} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description:
							payload.check_suite?.head_branch || "No branch",
						color:
							payload.check_suite?.conclusion === "success"
								? 0x43b581
								: payload.check_suite?.conclusion === "failure"
									? 0xf04747
									: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "discussion":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `💬 Discussion ${payload.discussion?.title} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.discussion?.body || "No body",
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "discussion_comment":
			return {
				username: "GitHub",
				embeds: [
					{
						title: `💬 Comment on Discussion #${payload.discussion?.number} in ${payload.repository?.full_name}`,
						type: EmbedType.rich,
						description: payload.comment?.body || "No comment",
						color: 0x7289da,
						thumbnail: {
							url: payload.sender?.avatar_url,
						},
						timestamp: new Date().toISOString(),
					},
				],
			};
		default:
			// console.debug("Unsupported GitHub event type:", eventType);
			return null;
	}
}

router.post(
	"/github",
	parseGitHubWebhook,
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

// https://discord.com/developers/docs/resources/webhook#execute-webhook
// TODO: Slack compatible hooks
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
