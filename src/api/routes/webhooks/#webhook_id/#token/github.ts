import { getProxyUrl, route } from "@spacebar/api";
import { capitalize, EmbedType, WebhookExecuteSchema } from "@spacebar/util";
import { NextFunction, Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { executeWebhook } from "../../../../util/handlers/Webhook";

const router = Router({ mergeParams: true });

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
			if (payload.action !== "created") {
				return null;
			}

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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// TODO: Improve this by adding `fields` to show recent commits
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
						timestamp: new Date().toISOString(),
					},
				],
			};
		case "watch":
			return null;
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
							proxy_url: getProxyUrl(
								new URL(payload.sender?.avatar_url),
								80,
								80,
							),
							width: 80,
							height: 80,
						},
						// @ts-expect-error Validate using string in schema
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
	"/",
	parseGitHubWebhook,
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

export default router;
