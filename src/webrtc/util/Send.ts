/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { JSONReplacer, EnvConfig } from "@spacebar/util";
import { VoicePayload } from "./Constants";
import { WebRtcWebSocket } from "./WebRtcWebSocket";
import { OPCODES } from "@spacebar/gateway";
import fs from "node:fs/promises";
import path from "node:path";

export async function Send(socket: WebRtcWebSocket, data: VoicePayload) {
    const logging = EnvConfig.get().logging.webrtcLogging;
    if (logging.enabled) {
        const opcodeName = OPCODES[data.op];

        let message = `[WebRTC] ~> ${socket.logUserRef} ${opcodeName}(${data.op})`;
        if (data.t !== undefined) message += ` ${data.t}`;
        if (data.s !== undefined) message += ` Seq=${data.s}`;
        if (logging.logPayload) message += ` ${JSON.stringify(data.d)}`;
        console.log(message);
    }

    const dumpPath = EnvConfig.get().logging.dumpWebrtcEventPath;
    if (dumpPath) {
        const id = socket.session_id || "unknown";

        await fs.mkdir(path.join(dumpPath!, id), {
            recursive: true,
        });
        await fs.writeFile(path.join(dumpPath!, id, `${Date.now()}.out.json`), JSON.stringify(data, null, 2));
    }

    let buffer: Buffer | string;

    // TODO: encode circular object
    if (socket.encoding === "json") buffer = JSON.stringify(data, JSONReplacer);
    else return;

    return new Promise((res, rej) => {
        if (socket.rawSocket.readyState !== 1) {
            // return rej("socket not open");
            socket.rawSocket.close();
            return;
        }

        socket.rawSocket.send(buffer, (err) => {
            if (err) return rej(err);
            return res(null);
        });
    });
}
