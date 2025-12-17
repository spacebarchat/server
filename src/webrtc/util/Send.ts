import { EnvConfig, JSONReplacer } from "@spacebar/util";
import { VoicePayload } from "./Constants";
import { WebRtcWebSocket } from "./WebRtcWebSocket";
import { OPCODES } from "@spacebar/gateway";
import fs from "fs/promises";
import path from "path";

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
		if (socket.readyState !== 1) {
			// return rej("socket not open");
			socket.close();
			return;
		}

		socket.send(buffer, (err) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
