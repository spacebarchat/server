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
import { initDatabase, Message } from "@spacebar/database";
import { GifProviderManager } from "@spacebar/integrations/gifs";
import { Config, ConnectionConfig, ConnectionLoader, Email, JSONReplacer, WebAuthn, initEvent, registerRoutes, JwtKeypairManager } from "@spacebar/util";
import { ProcessLifecycle, SystemdLifecycle } from "../util/util/ProcessLifecycle";
import { Monitoring } from "../util/monitoring/Monitoring";
// import { BcryptWorkerPool } from "../util/util/workers/bcrypt/BcryptWorkerPool";
import { Authentication, CORS, ImageProxy, BodyParser, ErrorHandler, initRateLimits, initTranslation } from "./middlewares";
import { initInstance } from "./util/handlers/Instance";
import { addPendingPoll } from "./util";

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
        await JwtKeypairManager.init();
        WebAuthn.init();
        // await BcryptWorkerPool.Init(8); // TODO: make configurable
        await GifProviderManager.init();

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
        this.app.use(Authentication);

        const app = this.app;
        const api = Router({ mergeParams: true });

        await initRateLimits(api);
        await initTranslation(api);

        this.routes = [
            ...(await registerRoutes(this, path.join(__dirname, "routes", "/"), api)),
            ...(await registerRoutes(this, path.join(__dirname, "routes_toplevel", "/"))),
        ].filter((r) => !!r);

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

        //app.use("/__development", )
        //app.use("/__internals", )

        app.use("/api/v6", api);
        app.use("/api/v7", api);
        app.use("/api/v8", api);
        app.use("/api/v9", api);
        app.use("/api/v10", api); // https://discord.com/developers/docs/change-log#api-v10
        app.use("/api", api); // allow unversioned requests

        app.use("/imageproxy/:hash/:size/:url", ImageProxy);

        // Pickup non-expired polls
        const nonExpiredPolls = await Message.createQueryBuilder("message").where("message.poll->>'expiry' > :now", { now: new Date().toISOString() }).getMany();

        for (const message of nonExpiredPolls) {
            if (!message.poll) {
                return;
            }

            addPendingPoll(message, new Date(message.poll.expiry).getTime() - Date.now());
        }

        this.app.use(ErrorHandler);

        await ConnectionLoader.loadConnections();

        if (logRequests) console.log(red(`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`));

        await super.start();
        await SystemdLifecycle.setStatus(`Listening on ${this.options.host}:${this.options.port}...`);
        await ProcessLifecycle.Ready();
    }
}
