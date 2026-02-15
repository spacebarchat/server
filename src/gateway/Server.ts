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

import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { checkToken, closeDatabase, Config, initDatabase, initEvent, Rights } from "@spacebar/util";
import ws from "ws";
import { Connection, openConnections } from "./events/Connection";
import http from "http";
import { cleanupOnStartup } from "./util/Utils";
import { randomString } from "@spacebar/api";
import { setInterval } from "timers";

export class Server {
    public ws: ws.Server;
    public port: number;
    public server: http.Server;
    public production: boolean;

    constructor({ port, server, production }: { port: number; server?: http.Server; production?: boolean }) {
        this.port = port;
        this.production = production || false;

        if (server) this.server = server;
        else {
            const elu = [1, 5, 15].map((x) => performance.eventLoopUtilization());
            const eluP = [1, 5, 15].map((x) => performance.eventLoopUtilization());
            const cpu = [1, 5, 15].map((x) => process.cpuUsage());
            let sec = 0;
            setInterval(() => {
                sec += 1;
                // for some reason this behaves differently from cpuUsage, so we need an absolute reference as "previous"
                const eluC = performance.eventLoopUtilization();

                cpu[0] = process.cpuUsage(cpu[0]);
                elu[0] = performance.eventLoopUtilization(eluP[0]);
                eluP[0] = eluC;
                if (sec % 5 === 0) {
                    cpu[1] = process.cpuUsage(cpu[1]);
                    elu[1] = performance.eventLoopUtilization(eluP[1]);
                    eluP[1] = eluC;
                }
                if (sec % 15 === 0) {
                    cpu[2] = process.cpuUsage(cpu[2]);
                    elu[2] = performance.eventLoopUtilization(eluP[2]);
                    eluP[2] = eluC;
                }
            }, 1000);

            this.server = http.createServer(async (req, res) => {
                if (!req.headers.cookie?.split("; ").find((x) => x.startsWith("__sb_sessid="))) {
                    res.setHeader("Set-Cookie", `__sb_sessid=${randomString(32)}; Secure; HttpOnly; SameSite=None; Path=/`);
                }
                const requestUrl = new URL(`http://${req.headers.host}${req.url}`);
                if (requestUrl.pathname === "/_spacebar/gateway/admin/introspect") {
                    if (!req.headers.authorization) {
                        return res.writeHead(401).end("Unauthorized");
                    } else {
                        const auth = req.headers.authorization.split(" ");
                        const sess = await checkToken(auth[1]);
                        if ((BigInt(sess.user.rights) & BigInt(Rights.FLAGS.OPERATOR)) === BigInt(0)) {
                            return res.writeHead(401).end("Unauthorized");
                        }
                    }
                    const useFullWsObj = requestUrl.searchParams.get("fullWs") === "true";
                    res.setHeader("Content-Type", "application/json")
                        .writeHead(200)
                        .end(
                            JSON.stringify(
                                {
                                    uptime: process.uptime(),
                                    resourceUsage: process.resourceUsage(),
                                    eventLoop: elu,
                                    cpu: cpu.map((x) => ({
                                        user: x.user / 1000,
                                        system: x.system / 1000,
                                    })),
                                    socketStates: {
                                        open: openConnections.length,
                                        healthy: openConnections.filter((x) => x.isHealthy !== false).length,
                                        unhealthy: openConnections.filter((x) => x.isHealthy === false).length,
                                        sessions: openConnections.map((x) => {
                                            // console.log(x);
                                            return useFullWsObj
                                                ? {
                                                      ...x,
                                                      ...{
                                                          _events: undefined,
                                                          _closeTimer: undefined,
                                                          accessToken: x.accessToken?.split(".")[0] + "." + x.accessToken?.split(".")[1] + ".***",
                                                      },
                                                  }
                                                : {
                                                      wsReadystate: x.readyState,
                                                      version: x.version,
                                                      user_id: x.user_id,
                                                      session_id: x.session_id,
                                                      accessToken: x.accessToken?.split(".")[0] + "." + x.accessToken?.split(".")[1] + +".***",
                                                      encoding: x.encoding,
                                                      compress: x.compress,
                                                      ipAddress: x.ipAddress,
                                                      userAgent: x.userAgent,
                                                      fingerprint: x.fingerprint,
                                                      shard_count: x.shard_count,
                                                      shard_id: x.shard_id,
                                                      deflate: x.deflate != null,
                                                      inflate: x.inflate != null,
                                                      zstdEncoder: x.zstdEncoder != null,
                                                      zstdDecoder: x.zstdDecoder != null,
                                                      heartbeatTimeout: x.heartbeatTimeout,
                                                      readyTimeout: x.readyTimeout,
                                                      intents: x.intents,
                                                      sequence: x.sequence,
                                                      permissions: x.permissions,
                                                      events: x.events,
                                                      member_events: x.member_events,
                                                      listen_options: x.listen_options,
                                                      capabilities: x.capabilities,
                                                      large_threshold: x.large_threshold,
                                                      qos: x.qos,
                                                      session: x.session,
                                                  };
                                        }),
                                    },
                                },
                                (key, value) => {
                                    if (value === null || value === undefined) return value;
                                    if (Object.getPrototypeOf(value)?.constructor?.name === "Timeout") return `[Timeout] ${value._idleTimeout}ms, repeat: ${value._repeat}`;
                                    if (Object.getPrototypeOf(value)?.constructor?.name === "BigInt") return value.toString() + "n";
                                    return value;
                                },
                                2,
                            ),
                        );
                    return;
                }

                res.writeHead(200).end("Online");
            });
        }

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
        await initDatabase();
        await Config.init();
        await initEvent();
        // temporary fix
        await cleanupOnStartup();

        if (!this.server.listening) {
            this.server.listen(this.port);
            console.log(`[Gateway] online on 0.0.0.0:${this.port}`);
        }
    }

    async stop() {
        this.ws.clients.forEach((x) => x.close());
        this.ws.close(() => {
            this.server.close(() => {
                closeDatabase();
            });
        });
    }
}
