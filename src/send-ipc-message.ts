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

import { emitEvent } from "@spacebar/util";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import moduleAlias from "module-alias";
moduleAlias(__dirname + "../../package.json");
import { config } from "dotenv";
config({ quiet: true });

process.env.DB_LOGGING = "true";

import fs from "node:fs/promises";
import { UnixSocketWriter } from "@spacebar/util/util/ipc/writer/UnixSocketWriter";
import { Event } from "@spacebar/util/interfaces/Event";
import { sleep } from "@spacebar/extensions";

function getArgvOrFail(idx: number, message: string) {
    if (process.argv.length <= idx) throw message + "\n";
    return process.argv[idx];
}

async function main() {
    const sockDir = getArgvOrFail(2, "Usage: node dist/send-ipc-message.js <socket dir>");
    if (!(await fs.readdir(sockDir))) throw `Socket directory "${sockDir}" is not a valid directory`;

    const unixWriter = new UnixSocketWriter(sockDir);
    await unixWriter.init();

    const payloadJson = await fs.readFile("/dev/stdin", "utf-8");
    const payload = JSON.parse(payloadJson) as Event;

    payload.origin ??= "send-ipc-message";
    payload.created_at ??= new Date();
    payload.transaction_id ??= process.pid.toString();

    const id = (payload.guild_id || payload.channel_id || payload.user_id || payload.session_id) as string;
    if (!id) return console.error("event doesn't contain any id", payload);
    // (payload as unknown).id = id;

    await unixWriter.emit(payload);
    console.log("Emitted...");
    await sleep(1000);
    await unixWriter.close();
    console.log("Closed...");
}

main().then(() => console.log("meow"));
