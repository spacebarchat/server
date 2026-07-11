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
import whyIsNodeRunning from "why-is-node-running";
import { DgramSocket } from "node-unix-socket";

interface ProcessLifecycleEvents {
    starting: unknown[];
    running: unknown[];
    stopping: unknown[];
    stopped: unknown[];
}

export class ProcessLifecycle {
    static state: keyof ProcessLifecycleEvents = "starting";
    static eventEmitter: EventEmitter<ProcessLifecycleEvents> = new EventEmitter();

    // to be ran after startup is finished
    static async Ready() {
        await this.emitAsync((this.state = "running"));
        await SystemdLifecycle.sendReady();
    }

    // to be ran at the start of shutdown
    static async Shutdown() {
        await SystemdLifecycle.sendStopping();
        await this.emitAsync((this.state = "stopping"));
    }

    // to be ran at the end of shutdown (clean up sockets, ...)
    static async Finalize() {
        await this.emitAsync((this.state = "stopped"));
    }

    // emit, except it awaits promises
    private static async emitAsync(eventName: keyof ProcessLifecycleEvents) {
        for (const evt of this.eventEmitter.listeners(eventName)) {
            // noinspection JSVoidFunctionReturnValueUsed - we want to handle async functions blocking aswell
            const res = evt() as void | Promise<void>;
            if (res) await res;
        }
    }
}

process.on("SIGUSR1", () => {
    console.log("Handling SIGUSR1:");
    whyIsNodeRunning();
    console.log("\nProcess state:", ProcessLifecycle.state);
});

export class SystemdLifecycle {
    private static writeData(data: string): Promise<void> {
        const socketPath = process.env.NOTIFY_SOCKET;
        if (!socketPath) return Promise.resolve();

        const buf = Buffer.from(data);
        console.log("Systemd notify socket path:", socketPath, "-", buf.length, "bytes");

        return new Promise((res, rej) => {
            new DgramSocket().sendTo(buf, 0, buf.length, socketPath, (err) => {
                if (err) rej(err);
                res();
            });
        });
    }
    static async sendReady() {
        await this.writeData("READY=1");
    }

    static async sendStopping() {
        await this.writeData("STOPPING=1");
    }

    static async setStatus(status: string) {
        await this.writeData("STATUS=" + status);
    }

    // TODO: do we want to support the watchdog?
}
