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

import EventEmitter from "node:events";
import fs from "node:fs";
import net, { Server } from "node:net";
import { BaseEventListener } from "./BaseEventListener";
import { EVENT, Event, EventOpts } from "@spacebar/util";
import { ProcessLifecycle } from "../../ProcessLifecycle";

export class UnixSocketListener extends BaseEventListener {
    eventEmitter: EventEmitter;
    socketPath: string;
    server: Server;
    isInitialized = false;

    constructor(socketPath: string) {
        super();
        this.eventEmitter = new EventEmitter();
        this.socketPath = socketPath;
    }

    async init() {
        // remove stale socket file if it exists
        // can happen if there's a PID conflict (across containers/PID namespaces)
        try {
            if (fs.existsSync(this.socketPath)) {
                fs.unlinkSync(this.socketPath);
                console.log("[UnixSocketListener] Removed stale socket file:", this.socketPath);
            }
        } catch (e) {
            console.error("[UnixSocketListener] Failed to remove stale socket:", e);
        }

        this.server = net.createServer((socket) => {
            socket.on("connect", () => {
                console.log("[UnixSocketListener] Unix socket client connected, now at", this.server.connections, "connections...");
            });
            let buffer = Buffer.alloc(0);
            socket.on("data", (data: Buffer) => {
                buffer = Buffer.concat([buffer, data]);
                while (buffer.length >= 4) {
                    const msgLen = buffer.readUInt32BE(0);
                    if (buffer.length < 4 + msgLen) break;
                    const msgBuf = buffer.subarray(4, 4 + msgLen);
                    buffer = buffer.subarray(4 + msgLen);
                    try {
                        const payload = JSON.parse(msgBuf.toString()) as { id: EVENT; event: Event };
                        this.eventEmitter.emit(payload.id, payload.event);
                    } catch (e) {
                        console.error("[UnixSocketListener] Failed to parse unix socket data:", e);
                    }
                }
            });
            socket.on("error", (err) => {
                console.error("[UnixSocketListener] Unix socket error:", err);
            });
            socket.on("close", () => {
                console.log("[UnixSocketListener] Unix socket client disconnected");
            });
        });

        this.server.listen(this.socketPath, () => {
            console.log(`[UnixSocketListener] Listening on ${this.socketPath}`);
        });

        ProcessLifecycle.eventEmitter.on("stopped", async () => await this.close());
        this.isInitialized = true;
    }

    async close(): Promise<void> {
        if (!this.isInitialized) {
            console.log("[UnixSocketListener] close() called before init! - Path:", this.socketPath, " - server:", this.server, " - this:", this);
        }

        console.log("[UnixSocketListener] Closing unix socket server");
        this.server.close();

        // clean up socket file
        try {
            fs.unlinkSync(this.socketPath);
        } catch (e) {
            if (e instanceof Error && "errno" in e && e.errno == -2) return;
            console.error("[UnixSocketListener] Failed to unlink socket file:", e);
        }
    }

    async listen(event: string, callback: (event: EventOpts) => unknown): Promise<() => Promise<void>> {
        const listener = (data: Event) => {
            callback({
                ...data,
                cancel,
            });
        };

        this.eventEmitter.addListener(event, listener);

        const cancel = async () => {
            this.eventEmitter.removeListener(event, listener);
            this.eventEmitter.setMaxListeners(this.eventEmitter.getMaxListeners() - 1);
        };

        this.eventEmitter.setMaxListeners(this.eventEmitter.getMaxListeners() + 1);

        return cancel;
    }
}
