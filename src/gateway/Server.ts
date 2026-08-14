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

import http from "node:http";
import ws from "ws";
import { Server, ServerOptions } from "lambert-server";
import { initDatabase } from "@spacebar/database";
import { Random } from "@spacebar/extensions";
import { Config, initEvent, JSONReplacer, JwtKeypairManager, registerRoutes } from "@spacebar/util";
import { ProcessLifecycle, SystemdLifecycle } from "../util/util/ProcessLifecycle";
import { Monitoring } from "../util/monitoring/Monitoring";
import { Connection } from "./events/Connection";
import { cleanupOnStartup } from "./util";
import morgan from "morgan";
import { Authentication, BodyParser, CORS, ErrorHandler } from "@spacebar/api";
import path from "node:path";
import { red } from "picocolors";

export class GatewayServer extends Server {
    public ws: ws.Server;

    constructor(options?: Partial<ServerOptions>) {
        super(options);

        this.http = http.createServer(this.app);

        this.http.on("upgrade", (request, socket, head) => {
            this.ws.handleUpgrade(request, socket, head, (socket) => {
                this.ws.emit("connection", socket, request);
            });
        });

        this.ws = new ws.Server({
            maxPayload: 4096,
            noServer: true,
        });
        this.ws.on("connection", Connection);
        this.ws.on("error", console.error);
    }

    async start(): Promise<void> {
        await Monitoring.init();
        Monitoring.attach(this.app);
        await initDatabase();
        await Config.init();
        await initEvent();
        // temporary fix
        await cleanupOnStartup();
        await JwtKeypairManager.init();

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

        this.routes = (await registerRoutes(this, path.join(__dirname, "routes", "/"))).filter((r) => !!r);

        this.app.get("/", (req, res) => res.status(200).send("Online"));

        this.app.use(ErrorHandler);
        if (logRequests) console.log(red(`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`));

        await super.start();
        await SystemdLifecycle.setStatus(`Listening on ${this.options.host}:${this.options.port}...`);

        await ProcessLifecycle.Ready();
    }

    async stop() {
        await ProcessLifecycle.Shutdown();
        this.ws.clients.forEach((x) => x.close());
        this.ws.close();
        this.http.close();
        await ProcessLifecycle.Finalize();
    }
}
