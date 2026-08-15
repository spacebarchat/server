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

import { JSONReplacer } from "@spacebar/util";
import { VoicePayload } from "./Constants";
import { WebRtcWebSocket } from "./WebRtcWebSocket";

export function Send(socket: WebRtcWebSocket, data: VoicePayload) {
    if (process.env.WRTC_WS_VERBOSE) console.log(`[WebRTC] Outgoing message: ${JSON.stringify(data)}`);

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
