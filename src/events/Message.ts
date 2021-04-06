import WebSocket, { Data } from "../util/WebSocket";
import erlpack from "erlpack";
import OPCodeHandlers from "../opcodes";
import { Payload, CLOSECODES } from "../util/Constants";
import { instanceOf, Tuple } from "lambert-server";

const PayloadSchema = {
	op: Number,
	$d: new Tuple(Object, Number), // or number for heartbeat sequence
	$s: Number,
	$t: String,
};

export async function Message(this: WebSocket, buffer: Data) {
	// TODO: compression
	var data: Payload;

	try {
		if (this.encoding === "etf" && buffer instanceof Buffer) data = erlpack.unpack(buffer);
		else if (this.encoding === "json" && typeof buffer === "string") data = JSON.parse(buffer);
		const result = instanceOf(PayloadSchema, data);
		if (result !== true) throw "invalid data";
	} catch (error) {
		return this.close(CLOSECODES.Decode_error);
	}

	// @ts-ignore
	const OPCodeHandler = OPCodeHandlers[data.op];
	if (!OPCodeHandler) {
		console.error("Unknown_opcode: " + data.op);
		// TODO: if all opcodes are implemented comment this out:
		// this.close(CLOSECODES.Unknown_opcode);
		return;
	}

	try {
		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error(error);
		return this.close(CLOSECODES.Unknown_error);
	}
}
