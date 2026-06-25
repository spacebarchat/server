/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import path from "node:path";
import { Request, Response, Router } from "express";
import morgan from "morgan";
import { Server, ServerOptions } from "lambert-server/Server";
import { red } from "picocolors";
import { getDatabase, initDatabase, Message } from "@spacebar/database";
import { Config, ConnectionConfig, ConnectionLoader, Email, JSONReplacer, WebAuthn, initEvent, registerRoutes, getRevInfoOrFail, pendingPolls } from "@spacebar/util";
import { ProcessLifecycle } from "../util/util/ProcessLifecycle";
import { Monitoring } from "../util/monitoring/Monitoring";
import { BcryptWorkerPool } from "../util/util/workers/bcrypt/BcryptWorkerPool";
import { Authentication, CORS, ImageProxy, BodyParser, ErrorHandler, initRateLimits, initTranslation } from "./middlewares";
import { initInstance } from "./util/handlers/Instance";
import { route, sendMessage } from "./util";
import { EmbedType, MessageReferenceType, MessageType, PollAnswerCount } from "@spacebar/schemas";

const ASSETS_FOLDER = path.join(__dirname, "..", "..", "assets");
const PUBLIC_ASSETS_FOLDER = path.join(ASSETS_FOLDER, "public");

export type SpacebarServerOptions = ServerOptions;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            server: SpacebarServer;
        }
    }
}

export class SpacebarServer extends Server {
    declare public options: SpacebarServerOptions;

    constructor(opts?: Partial<SpacebarServerOptions>) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super(opts);
    }

    async start() {
        await Monitoring.init();
        Monitoring.attach(this.app);
        await initDatabase();
        await Config.init();
        await initEvent();
        await Email.init();
        await ConnectionConfig.init();
        await initInstance();
        WebAuthn.init();
        // await BcryptWorkerPool.Init(8); // TODO: make configurable

        const logRequests = process.env["LOG_REQUESTS"] != undefined;
        if (logRequests) {
            this.app.use(
                morgan("combined", {
                    skip: (req, res) => {
                        let skip = !(process.env["LOG_REQUESTS"]?.includes(res.statusCode.toString()) ?? false);
                        if (process.env["LOG_REQUESTS"]?.charAt(0) == "-") skip = !skip;
                        return skip;
                    },
                }),
            );
        }

        this.app.set("json replacer", JSONReplacer);
        this.app.disable("x-powered-by");

        const trustedProxies = Config.get().security.trustedProxies;
        if (trustedProxies) this.app.set("trust proxy", trustedProxies);

        this.app.use(CORS);
        this.app.use(BodyParser({ inflate: true, limit: "10mb" }));

        const app = this.app;
        const api = Router({ mergeParams: true });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.app = api;

        api.use(Authentication);
        await initRateLimits(api);
        await initTranslation(api);

        this.routes = (await registerRoutes(this, path.join(__dirname, "routes", "/"))).filter((r) => !!r);

        // 404 is not an error in express, so this should not be an error middleware
        // this is a fine place to put the 404 handler because its after we register the routes
        // and since its not an error middleware, our error handler below still works.
        // Emma [it/its] @ Rory& - the _ is required now, as pillarjs throw an error if you don't pass a param name now
        api.use("*_", (req: Request, res: Response) => {
            res.status(404).json({
                message: "Endpoint not found",
                code: 404,
                request: `${req.method} ${req.url}`,
            });
        });

        this.app = app;

        //app.use("/__development", )
        //app.use("/__internals", )

        app.use("/api/v6", api);
        app.use("/api/v7", api);
        app.use("/api/v8", api);
        app.use("/api/v9", api);
        app.use("/api/v10", api); // https://discord.com/developers/docs/change-log#api-v10
        app.use("/api", api); // allow unversioned requests

        app.use("/imageproxy/:hash/:size/:url", ImageProxy);

        app.get("/", (req, res) => {
            res.set("Cache-Control", "public, max-age=21600");
            return res.sendFile(path.join(PUBLIC_ASSETS_FOLDER, "index.html"));
        });

        app.get("/verify-email", (req, res) => {
            res.set("Cache-Control", "public, max-age=21600");
            return res.sendFile(path.join(PUBLIC_ASSETS_FOLDER, "verify.html"));
        });

        app.get("/widget", (req, res) => {
            res.set("Cache-Control", "public, max-age=21600");
            return res.sendFile(path.join(PUBLIC_ASSETS_FOLDER, "widget.html"));
        });

        app.get("/_spacebar/api/schemas.json", (req, res) => {
            res.sendFile(path.join(ASSETS_FOLDER, "schemas.json"));
        });

        app.get("/_spacebar/api/openapi.json", (req, res) => {
            res.sendFile(path.join(ASSETS_FOLDER, "openapi.json"));
        });

        app.get("/_spacebar/api/version", (req, res) => {
            res.json({
                implementation: "spacebar-server-ts",
                version: getRevInfoOrFail(),
            });
        });

        // current well-known location
        app.get("/.well-known/spacebar", (req, res) => {
            res.json({
                api: (Config.get().api.endpointPublic + "/api/").replace("//api/", "/api/"),
            });
        });

        // new well-known location
        app.get("/.well-known/spacebar/client", (req, res) => {
            res.json({
                api: {
                    baseUrl: Config.get().api.endpointPublic?.split("/api/")[0],
                    apiVersions: {
                        default: Config.get().api.defaultVersion,
                        active: Config.get().api.activeVersions,
                    },
                },
                cdn: {
                    baseUrl: Config.get().cdn.endpointPublic,
                },
                gateway: {
                    baseUrl: Config.get().gateway.endpointPublic,
                    encoding: ["etf", "json"],
                    compression: ["zstd-stream", "zlib-stream", null],
                },
                admin:
                    Config.get().admin.endpointPublic === null
                        ? undefined
                        : {
                              baseUrl: Config.get().admin.endpointPublic,
                          },
            });
        });

        // Pickup non-expired polls
        const nonExpiredPolls = await Message.createQueryBuilder("message").where("message.poll->>'expiry' > :now", { now: new Date().toISOString() }).getMany();
        console.log(nonExpiredPolls);

        for (const message of nonExpiredPolls) {
            if (!message.poll) {
                return;
            }

            pendingPolls.set(message.id, {
                timeout: setTimeout(
                    async () => {
                        if (!message.poll?.results) {
                            return;
                        }

                        const allAnswerCounts = message.poll.results.answer_counts as unknown as (Omit<PollAnswerCount, "me_voted"> & { voters: string[] })[];

                        const totalVotes = allAnswerCounts.map((a) => a.voters).length;
                        const winningAnswerCounts = allAnswerCounts.filter((a) => (a.count * totalVotes) / 100);

                        const pollResultsMessage = {
                            type: MessageType.POLL_RESULT,
                            channel_id: message.channel_id,
                            author_id: message.author_id,
                            message_reference: {
                                type: MessageReferenceType.DEFAULT,
                                message_id: message.id,
                                channel_id: message.channel_id,
                            },
                            embeds: [
                                {
                                    type: EmbedType.poll_result,
                                    id: message.id,
                                    fields: [
                                        {
                                            name: "poll_question_text",
                                            value: message.poll.question.text!,
                                        },
                                        {
                                            name: "total_votes",
                                            value: totalVotes.toString(),
                                        },
                                    ],
                                },
                            ],
                        };

                        if (winningAnswerCounts) {
                            const winningAnswer = message.poll.answers.find((a) => a.answer_id === Number(winningAnswerCounts[0]?.id))!;

                            if (winningAnswerCounts.length === 0) {
                                pollResultsMessage.embeds[0].fields.push({
                                    name: "victor_answer_votes",
                                    value: "0",
                                });
                            } else if (winningAnswerCounts.length === 1) {
                                pollResultsMessage.embeds[0].fields.push(
                                    {
                                        name: "victor_answer_votes",
                                        value: winningAnswerCounts[0].count.toString(),
                                    },
                                    {
                                        name: "victor_answer_id",
                                        value: winningAnswerCounts[0].id,
                                    },
                                    {
                                        name: "victor_answer_text",
                                        value: winningAnswer.poll_media.text!,
                                    },
                                );
                            } else if (winningAnswerCounts.length > 1) {
                                pollResultsMessage.embeds[0].fields.push({
                                    name: "victor_answer_votes",
                                    value: winningAnswerCounts[0].count.toString(),
                                });
                            }

                            if (winningAnswer?.poll_media.emoji) {
                                pollResultsMessage.embeds[0].fields.push(
                                    {
                                        name: "victor_answer_emoji_id",
                                        value: winningAnswer.poll_media.emoji.id!.toString()!,
                                    },
                                    {
                                        name: "victor_answer_emoji_name",
                                        value: winningAnswer.poll_media.emoji.name!,
                                    },
                                    {
                                        name: "victor_answer_emoji_animated",
                                        value: `${winningAnswer.poll_media.emoji.animated}`,
                                    },
                                );
                            }
                        }

                        await sendMessage(pollResultsMessage);
                        pendingPolls.delete(message.id);
                    },
                    new Date(message.poll.expiry).getTime() - Date.now(),
                ),
            });
        }

        function isReady(req: Request, res: Response) {
            if (!getDatabase()) return res.sendStatus(503);
            return res.sendStatus(200);
        }

        app.get("/readyz", route({ description: "Get the ready state of the server" }), isReady);
        app.get("/healthz", route({ description: "Get the ready state of the server" }), isReady);

        this.app.use(ErrorHandler);

        await ConnectionLoader.loadConnections();

        if (logRequests) console.log(red(`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`));

        await ProcessLifecycle.Ready();
        return super.start();
    }
}
