import { WebSocket, Payload, CLOSECODES, OPCODES } from "@fosscord/webrtc";
import OPCodeHandlers from "../opcodes";
import { instanceOf, Tuple } from "lambert-server";
import WS from "ws";

const PayloadSchema = {
	op: Number,
	$d: new Tuple(Object, Number), // or number for heartbeat sequence
	$s: Number,
	$t: String,
};

export async function Message(this: WebSocket, buffer: WS.Data) {
	try {
		var data: Payload = JSON.parse(buffer.toString());

		const errors = instanceOf(PayloadSchema, data);
		if (errors !== true) throw errors;

		// @ts-ignore
		const OPCodeHandler = OPCodeHandlers[data.op];
		if (!OPCodeHandler) {
			console.error("[WebRTC] Unkown opcode " + data.op);
			// TODO: if all opcodes are implemented comment this out:
			// this.close(CLOSECODES.Unknown_opcode);
			return;
		}

		console.log("[WebRTC] Opcode " + OPCODES[data.op]);

		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error(error);
		if (!this.CLOSED && this.CLOSING)
			return this.close(CLOSECODES.Unknown_error);
	}
}
