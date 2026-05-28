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

import net, { Socket } from "node:net";
import fs, { FSWatcher } from "node:fs";
import path from "node:path";
import { red } from "picocolors";
import { BaseEventWriter } from "./BaseEventWriter";
import { Event, Stopwatch } from "@spacebar/util";

export class UnixSocketWriter extends BaseEventWriter {
    socketPath: string;
    clients: { [key: string]: Socket } = {};
    watcher?: FSWatcher;
    backlog: Event[] = [];
    broadcastLock: Promise<void> = Promise.resolve();
    replayLock: Promise<void> = Promise.resolve();
    isInitializing = true;

    constructor(socketPath: string) {
        super();
        this.socketPath = socketPath;
    }

    async init() {
        if (!fs.opendirSync(this.socketPath)) throw new Error("Unix socket path does not exist or is not a directory: " + this.socketPath);

        console.log("[UnixSocketWriter] Unix socket writer initializing for", this.socketPath);

        const connect = (file: string) => {
            const fullPath = path.join(this.socketPath, file);
            const pid = Number(path.basename(file, ".sock"));
            console.log("[UnixSocketWriter] Attempting to connect to unix socket:", fullPath, "| proc:", getPidCmdline(pid) ?? red("No such pid: " + pid));

            // avoid duplicate connections
            if (this.clients[fullPath] && !this.clients[fullPath].destroyed) {
                console.log("[UnixSocketWriter] Unix socket client already connected to", fullPath);
                return;
            }

            // clean up old connection if it exists
            if (this.clients[fullPath]) {
                console.log("[UnixSocketWriter] Removing stale unix socket client for", fullPath);
                try {
                    this.clients[fullPath].destroy();
                } catch (e) {
                    // ignore
                }
                delete this.clients[fullPath];
            }

            // check if it's actually a socket file (not a ghost/regular file)
            try {
                const stats = fs.statSync(fullPath);
                if (!stats.isSocket()) {
                    console.log("[UnixSocketWriter] Ignoring non-socket file:", fullPath);
                    return;
                }
            } catch (e) {
                console.log("[UnixSocketWriter] Cannot stat socket file:", fullPath);
                return;
            }

            try {
                this.clients[fullPath] = net.createConnection(fullPath, () => {
                    console.log("[UnixSocketWriter] Unix socket client connected to", fullPath);
                });

                this.clients[fullPath].on("error", (err) => {
                    console.error("[UnixSocketWriter] Unix socket client error on", fullPath, ":", err);
                    // clean up after error
                    if (this.clients[fullPath]) {
                        delete this.clients[fullPath];
                    }
                });

                // handle clean socket closure
                this.clients[fullPath].on("close", () => {
                    console.log("[UnixSocketWriter] Unix socket client closed:", fullPath);
                    delete this.clients[fullPath];
                });
            } catch (e) {
                console.error("[UnixSocketWriter] Failed to create connection to", fullPath, ":", e);
                delete this.clients[fullPath];
            }
        };

        // connect to all sockets, now and in the future
        this.watcher = fs.watch(this.socketPath, {}, (eventType, filename) => {
            console.log("[UnixSocketWriter] Unix socket writer received watch sig", eventType, filename);
            if (eventType === "rename" && filename?.endsWith(".sock")) {
                try {
                    const fullPath = path.join(this.socketPath, filename!);
                    if (fs.existsSync(fullPath)) {
                        connect(filename!);
                    } else {
                        if (this.clients[fullPath]) {
                            console.log("[UnixSocketWriter] Unix socket writer detected removed socket:", fullPath);
                            try {
                                this.clients[fullPath].destroy();
                            } catch (e) {
                                // socket may already be destroyed
                            }
                            delete this.clients[fullPath];
                        }
                    }
                } catch (e) {
                    // don't
                }
            }
        });

        this.watcher.on("error", (err) => {
            console.error("[UnixSocketWriter] Unix socket watcher error:", err);
        });

        // connect to existing sockets if any
        try {
            const files = fs.readdirSync(this.socketPath);
            console.log("[UnixSocketWriter] Unix socket writer found existing sockets:", files);
            files.forEach((file) => {
                if (file.endsWith(".sock")) {
                    connect(file);
                }
            });
        } catch (err) {
            console.error("[UnixSocketWriter] Unix socket writer failed to read directory:", err);
        }

        for (const sig of ["SIGINT", "SIGTERM", "SIGQUIT"] as const) {
            process.on(sig, () => this.close());
        }

        this.isInitializing = false;
    }

    async emit(event: Event) {
        if (!this.clients) throw new Error("UnixSocketWriter not initialized");

        // check if there are any listeners
        const clientCount = Object.entries(this.clients).length;
        if (clientCount === 0) {
            console.warn("[UnixSocketWriter] Unix socket writer has no connected clients to emit to, backlog size:", this.backlog.length + 1);
            this.backlog.push(event);
            if (!this.isInitializing) {
                this.isInitializing = true;
                console.log("[UnixSocketWriter] Re-initializing unix socket writer due to new event with no listeners");
                await this.close();
                await this.init();
            }
            return;
        }

        await this.replayLock;
        await (this.replayLock = Promise.resolve().then(async () => {
            if (this.backlog.length > 0) {
                console.log(`[UnixSocketWriter] Replaying ${this.backlog.length} backlog events`);
                for (const backlogEvent of this.backlog) {
                    await this.broadcast(backlogEvent);
                }
                this.backlog = [];
            }
        }));

        await this.broadcast(event);
    }

    private async broadcast(event: Event) {
        await this.broadcastLock;
        return await (this.broadcastLock = new Promise((res) => {
            const tsw = Stopwatch.startNew();
            const payloadBuf = Buffer.from(JSON.stringify({ id: (event.guild_id || event.channel_id || event.user_id || event.session_id) as string, event }));
            const lenBuf = Buffer.alloc(4);
            lenBuf.writeUInt32BE(payloadBuf.length, 0);
            const framed = Buffer.concat([lenBuf, payloadBuf]);

            for (const [socketPath, socket] of Object.entries(this.clients)) {
                if (socket.destroyed) {
                    console.log("[UnixSocketWriter] Unix socket writer found destroyed socket, removing:", socketPath);
                    delete this.clients[socketPath];
                    continue;
                }

                try {
                    socket.write(framed);
                } catch (e) {
                    console.error("[UnixSocketWriter] Unix socket writer failed to write to socket", socketPath, ":", e);
                }
            }

            if (tsw.elapsed().totalMilliseconds > 5)
                // else it's too noisy
                console.log(`[UnixSocketWriter] Unix socket writer emitted to ${Object.entries(this.clients).length} sockets in ${tsw.elapsed().totalMilliseconds}ms`);
            res();
        }));
    }

    async close() {
        console.log("[UnixSocketWriter] Closing Unix socket writer");

        if (this.watcher) {
            this.watcher.close();
            this.watcher = undefined;
        }

        for (const [path, socket] of Object.entries(this.clients)) {
            try {
                socket.destroy();
            } catch (e) {
                console.error("[UnixSocketWriter] Error closing socket", path, ":", e);
            }
        }
        this.clients = {};
    }
}

function getPidCmdline(pid: number): string | null {
    try {
        const cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, "utf-8");
        return cmdline.replaceAll("\0", " ").trim();
    } catch (e) {
        return null;
    }
}
