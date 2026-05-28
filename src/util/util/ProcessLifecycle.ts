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
    }

    // to be ran at the start of shutdown
    static async Shutdown() {
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
