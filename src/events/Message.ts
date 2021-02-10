import WebSocket, { Data } from "../util/WebSocket";
import erlpack from "erlpack";
import OPCodeHandlers from "../opcodes";
import { Payload, CLOSECODES } from "../util/Constants";
import { instanceOf } from "lambert-server";

const PayloadSchema = {
	op: Number,
	$d: Object,
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
	if (!OPCodeHandler) return this.close(CLOSECODES.Unknown_opcode);

	try {
		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error(error);
		return this.close(CLOSECODES.Unknown_error);
	}
}
