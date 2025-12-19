import { getProxyUrl, route } from "@spacebar/api";
import { NextFunction, Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { executeWebhook } from "../../../../util/handlers/Webhook";
import { WebhookExecuteSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

const parseGitHubWebhook = (req: Request, res: Response, next: NextFunction) => {
    const eventType = req.headers["x-github-event"] as string;
    if (!eventType) {
        throw new HTTPError("Missing X-GitHub-Event header", 400);
    }

    const discordPayload: WebhookExecuteSchema = {
        username: "GitHub",
        avatar_url: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
    };

    switch (eventType) {
        case "commit_comment":
            if (req.body.action !== "created") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] New comment on commit \`${req.body.comment.commit_id.slice(0, 7)}\``,
                    description: req.body.comment.body.length > 500 ? `${req.body.comment.body.slice(0, 497)}...` : req.body.comment.body,
                    url: req.body.comment.html_url,
                },
            ];
            break;
        case "create":
            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] New ${req.body.ref_type} created: ${req.body.ref}`,
                },
            ];
            break;
        case "delete":
            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] ${req.body.ref_type} deleted: ${req.body.ref}`,
                },
            ];
            break;
        case "fork":
            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] Fork created: ${req.body.forkee.full_name}`,
                    url: req.body.forkee.html_url,
                },
            ];
            break;
        case "issue_comment":
            if (req.body.action !== "created") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    color: "pull_request" in req.body.issue ? 12576191 : 15109472,
                    title: `[${req.body.repository.full_name}] New comment on ${"pull_request" in req.body.issue ? "pull request" : "issue"} #${req.body.issue.number}: ${
                        req.body.issue.title.length > 150 ? `${req.body.issue.title.slice(0, 147)}...` : req.body.issue.title
                    }`,
                    url: req.body.comment.html_url,
                    description: req.body.comment.body.length > 500 ? `${req.body.comment.body.slice(0, 497)}...` : req.body.comment.body,
                },
            ];
            break;
        case "issues":
            if (!["opened", "closed"].includes(req.body.action)) {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] Issue ${req.body.action} #${req.body.issue.number}: ${req.body.issue.title}`,
                    url: req.body.issue.html_url,
                },
            ];

            if (req.body.action === "opened") {
                discordPayload.embeds[0].color = 15426592;
                discordPayload.embeds[0].description = req.body.issue.body.length > 500 ? `${req.body.issue.body.slice(0, 497)}...` : req.body.issue.body;
            }
            break;
        case "member":
            if (req.body.action !== "added") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] New collaborator added: ${req.body.member.login}`,
                    url: req.body.member.html_url,
                },
            ];
            break;
        case "public":
            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] Now open sourced!`,
                },
            ];
            break;
        case "pull_request": // funfact: for some reason, if a PR's title is over 216 chars in length you won't see any actions taken on the PR on discord
            if (!["opened", "closed"].includes(req.body.action)) {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] Pull request ${req.body.action}: #${req.body.number} ${req.body.pull_request.title.length > 216 ? `${req.body.pull_request.title.slice(0, 213)}...` : req.body.pull_request.title}`,
                    url: req.body.pull_request.html_url,
                },
            ];

            if (req.body.action === "opened") {
                if (req.body.pull_request.body != null) {
                    discordPayload.embeds[0].description = req.body.pull_request.body.length > 500 ? `${req.body.pull_request.body.slice(0, 497)}...` : req.body.pull_request.body;
                }
                discordPayload.embeds[0].color = 38912;
            }
            break;
        case "pull_request_review": // funfact: for some reason, if a PR's title is over 216 chars in length you won't see any actions taken on the PR on discord
            if (req.body.action !== "submitted") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] Pull request review submitted: #${req.body.pull_request.number} ${req.body.pull_request.title.length > 216 ? `${req.body.pull_request.title.slice(0, 213)}...` : req.body.pull_request.title}`,
                    description: req.body.review.body.length > 500 ? `${req.body.review.body.slice(0, 497)}...` : req.body.review.body,
                    url: req.body.review.html_url,
                },
            ];
            break;
        case "pull_request_review_comment": // funfact: for some reason, if a PR's title is over 216 chars in length you won't see any actions taken on the PR on discord
            if (req.body.action !== "created") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    color: 12576191,
                    title: `[${req.body.repository.full_name}] New review comment on pull request: #${req.body.pull_request.number} ${req.body.pull_request.title.length > 216 ? `${req.body.pull_request.title.slice(0, 213)}...` : req.body.pull_request.title}`,
                    description: req.body.comment.body.length > 500 ? `${req.body.comment.body.slice(0, 497)}...` : req.body.comment.body,
                    url: req.body.comment.html_url,
                },
            ];
            break;
        case "push":
            if (!req.body.ref.startsWith("refs/heads/")) {
                return;
            }

            if (req.body.forced) {
                discordPayload.embeds = [
                    {
                        color: 16525609,
                        author: {
                            name: req.body.sender.login,
                            icon_url: req.body.sender.avatar_url,
                            proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                            url: req.body.sender.html_url,
                        },
                        title: `[${req.body.repository.name}] Branch ${req.body.ref.slice(11)} was force-pushed to \`${req.body.head_commit.id.slice(0, 7)}\``,
                        description: `[Compare changes](${req.body.compare})`,
                    },
                ];
            } else {
                discordPayload.embeds = [
                    {
                        color: 7506394,
                        author: {
                            name: req.body.sender.login,
                            icon_url: req.body.sender.avatar_url,
                            proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                            url: req.body.sender.html_url,
                        },
                        title: `[${req.body.repository.name}:${req.body.ref.slice(11)}] ${req.body.commits.length} new commit${req.body.commits.length > 1 ? "s" : ""}`,
                        url: req.body.commits.length > 1 ? req.body.compare : req.body.head_commit.url,
                        description: req.body.commits
                            .slice(0, 5) // Discord only shows 5 first commits
                            .map(
                                (c: { id: string; url: string; message: string; author: { username: string } }) =>
                                    `[\`${c.id.slice(0, 7)}\`](${c.url}) ${c.message.split("\n")[0].length > 49 ? `${c.message.slice(0, 47)}...` : c.message.split("\n")[0]} - ${c.author.username}`,
                            )
                            .join("\n"),
                    },
                ];
            }
            break;
        case "release":
            if (req.body.action !== "created") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] New release published: ${req.body.release.tag_name}`,
                    url: req.body.release.html_url,
                },
            ];
            break;
        case "watch":
            if (req.body.action !== "started") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    title: `[${req.body.repository.full_name}] New star added`,
                    url: req.body.repository.html_url,
                },
            ];
            break;
        case "check_run":
            if (req.body.action !== "completed") {
                return;
            }

            discordPayload.embeds = [
                {
                    color: req.body.check_run.conclusion == "success" ? 38912 : 16525609,
                    title: `[${req.body.repository.name}] ${req.body.check_run.name} ${req.body.check_run.conclusion} on ${req.body.check_run.check_suite.head_branch}`,
                    url: req.body.check_run.html_url,
                },
            ];
            break;
        case "check_suite":
            if (req.body.action !== "completed") {
                return;
            }

            discordPayload.embeds = [
                {
                    color: req.body.check_suite.conclusion == "success" ? 38912 : 16525609,
                    title: `[${req.body.repository.name}] GitHub Actions checks ${req.body.check_suite.conclusion} on ${req.body.check_suite.head_branch}`,
                    url: `https://github.com/${req.body.repository.full_name}/commit/${req.body.check_suite.head_commit.id}`,
                },
            ];
            break;
        case "discussion":
            if (req.body.action !== "created") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    color: 15109472,
                    title: `[${req.body.repository.name}] New discussion #${req.body.discussion.number}: ${req.body.discussion.title.length > 150 ? `${req.body.discussion.title.slice(0, 151)}...` : req.body.discussion.title}`,
                    url: req.body.discussion.html_url,
                    description: req.body.discussion.body.length > 500 ? `${req.body.discussion.body.slice(0, 497)}...` : req.body.discussion.body,
                },
            ];
            break;
        case "discussion_comment":
            if (req.body.action !== "created") {
                return;
            }

            discordPayload.embeds = [
                {
                    author: {
                        name: req.body.sender.login,
                        icon_url: req.body.sender.avatar_url,
                        proxy_icon_url: getProxyUrl(new URL(req.body.sender.avatar_url), 80, 80),
                        url: req.body.sender.html_url,
                    },
                    color: 15109472,
                    title: `[${req.body.comment.repository_url}] New comment on discussion #${req.body.discussion.number}: ${req.body.discussion.title.length > 150 ? `${req.body.discussion.title.slice(0, 151)}...` : req.body.discussion.title}`,
                    url: req.body.comment.html_url,
                    description: req.body.comment.body.length > 500 ? `${req.body.comment.body.slice(0, 497)}...` : req.body.comment.body,
                },
            ];
            break;
        default:
            return res.status(204).end(); // Yes, discord sends 204 even on invalid event
    }

    req.body = discordPayload;
    req.query.wait ||= "true";

    next();
};

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
                description: "waits for server confirmation of message send before response, and returns the created message body",
            },
            thread_id: {
                type: "string",
                required: false,
                description: "Send a message to the specified thread within a webhook's channel.",
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
