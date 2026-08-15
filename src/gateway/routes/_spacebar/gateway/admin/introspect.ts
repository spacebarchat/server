/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { route } from "@spacebar/api/middlewares";
import { Request, Response, Router } from "express";
import { ProcessLifecycle } from "@spacebar/util/util/ProcessLifecycle";
import { openConnections } from "@spacebar/gateway/events/Connection";

const router: Router = Router({ mergeParams: true });

const elu = [1, 5, 15].map(() => performance.eventLoopUtilization());
const eluP = [1, 5, 15].map(() => performance.eventLoopUtilization());
const cpu = [1, 5, 15].map(() => process.cpuUsage());
let sec = 0;
const monitoringLoop = setInterval(() => {
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

ProcessLifecycle.eventEmitter.on("stopping", () => clearTimeout(monitoringLoop));

router.get(
    "/",
    route({
        right: "OPERATOR",
        responses: {
            200: {},
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    (req: Request, res: Response) => {
        const useFullWsObj = req.params.fullWs == "true";
        res.set("Content-Type", "application/json").send(
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
                        sessions: openConnections.map((x) =>
                            // console.log(x);
                            // TODO: move to socket object
                            useFullWsObj
                                ? {
                                      ...x,
                                      ...{
                                          _events: undefined,
                                          _closeTimer: undefined,
                                          accessToken: x.accessToken?.split(".")[0] + "." + x.accessToken?.split(".")[1] + ".***",
                                      },
                                  }
                                : {
                                      wsReadystate: x.rawSocket.readyState,
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
                                  },
                        ),
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
    },
);

export default router;
