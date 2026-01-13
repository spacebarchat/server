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

import { Config, ConnectionConfig, ConnectionLoader, Email, JSONReplacer, WebAuthn, initDatabase, initEvent, registerRoutes } from "@spacebar/util";
import { Authentication, CORS, ImageProxy, BodyParser, ErrorHandler, initRateLimits, initTranslation } from "./middlewares";
import { Request, Response, Router } from "express";
import { Server, ServerOptions } from "lambert-server";
import morgan from "morgan";
import path from "path";
import { red } from "picocolors";
import { initInstance } from "./util/handlers/Instance";

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
        super({ ...opts, errorHandler: false, jsonBody: false });
    }

    async start() {
        await initDatabase();
        await Config.init();
        await initEvent();
        await Email.init();
        await ConnectionConfig.init();
        await initInstance();
        WebAuthn.init();

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

        // current well-known location
        app.get("/.well-known/spacebar", (req, res) => {
            res.json({
                api: (Config.get().api.endpointPublic + "/api/").replace("//api/", "/api/"),
            });
        });

        // new well-known location
        app.get("/.well-known/spacebar/client", (req, res) => {
            let erlpackSupported = false;
            try {
                require("@yukikaze-bot/erlpack");
                erlpackSupported = true;
            } catch (e) {
                // empty
            }

            res.json({
                api: {
                    baseUrl: Config.get().api.endpointPublic,
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
                    encoding: [...(erlpackSupported ? ["etf"] : []), "json"],
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

        this.app.use(ErrorHandler);

        ConnectionLoader.loadConnections();

        if (logRequests) console.log(red(`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`));

        return super.start();
    }
}
