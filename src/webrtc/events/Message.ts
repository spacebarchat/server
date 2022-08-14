import OPCodeHandlers from "../opcodes";
import { instanceOf, Tuple } from "lambert-server";
import WS, { WebSocket } from "ws";
import { Payload, CloseCodes } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";

const PayloadSchema = {
	op: Number,
	$d: new Tuple(Object, Number), // or number for heartbeat sequence
	$s: Number,
	$t: String
};

export async function onMessage(this: WebSocket, buffer: WS.Data) {
	try {
		var data: Payload = JSON.parse(buffer.toString());

		// @ts-ignore
		const OPCodeHandler = OPCodeHandlers[data.op];
		if (!OPCodeHandler) {
			// @ts-ignore
			console.error("[WebRTC] Unkown opcode " + VoiceOPCodes[data.op]);
			// TODO: if all opcodes are implemented comment this out:
			// this.close(CloseCodes.Unknown_opcode);
			return;
		}

		// @ts-ignore
		console.log("[WebRTC] Opcode " + VoiceOPCodes[data.op]);

		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error("[WebRTC] error", error);
		// if (!this.CLOSED && this.CLOSING) return this.close(CloseCodes.Unknown_error);
	}
}
