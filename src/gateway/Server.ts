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
import { Config, initEvent, JwtKeypairManager } from "@spacebar/util";
import { ProcessLifecycle, SystemdLifecycle } from "../util/util/ProcessLifecycle";
import { Monitoring } from "../util/monitoring/Monitoring";
import { Connection } from "./events/Connection";
import { cleanupOnStartup } from "./util";

export class GatewayServer extends Server {
    public ws: ws.Server;
    public port: number;
    public server: http.Server;
    public production: boolean;
    private monitoringLoop: NodeJS.Timeout;

    constructor(options?: Partial<ServerOptions>) {
        super(options);

        this.server = http.createServer(async (req, res) => {
            if (!req.headers.cookie?.split("; ").find((x) => x.startsWith("__sb_sessid="))) {
                res.setHeader(
                    "Set-Cookie",
                    `__sb_sessid=${Random.getString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 32)}; Secure; HttpOnly; SameSite=None; Path=/`,
                );
            }
            const requestUrl = new URL(`http://${req.headers.host}${req.url}`);
            if (requestUrl.pathname === "/metrics") {
                return await Monitoring.handleRawRequest(req, res);
            }

            res.writeHead(200).end("Online");
        });

        this.server.on("upgrade", (request, socket, head) => {
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
        await initDatabase();
        await Config.init();
        await initEvent();
        // temporary fix
        await cleanupOnStartup();
        await JwtKeypairManager.init();

        if (!this.server.listening) {
            this.server.listen(this.port);
            console.log(`[Gateway] online on 0.0.0.0:${this.port}`);
            await SystemdLifecycle.setStatus(`Listening on 0.0.0.0:${this.port}...`);
        }

        await ProcessLifecycle.Ready();
    }

    async stop() {
        await ProcessLifecycle.Shutdown();
        clearInterval(this.monitoringLoop);
        this.ws.clients.forEach((x) => x.close());
        this.ws.close();
        this.server.close();
        await ProcessLifecycle.Finalize();
    }
}
