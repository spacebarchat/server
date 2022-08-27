import { Payload, WebSocket } from "@fosscord/gateway";
import OPCodeHandlers from "../opcodes";
import { check } from "../opcodes/instanceOf";
import { CloseCodes } from "../util/Constants";
let erlpack: any;
try {
	erlpack = require("@yukikaze-bot/erlpack");
} catch (error) {}

const PayloadSchema = {
	op: Number,
	$d: Object || Number, // or number for heartbeat sequence
	$s: Number,
	$t: String
};

export async function Message(this: WebSocket, buffer: Buffer) {
	// TODO: compression
	let data: Payload;

	if (this.encoding === "etf" && buffer instanceof Buffer) data = erlpack.unpack(buffer);
	else if (this.encoding === "json")
		data = JSON.parse(buffer as unknown as string); //TODO: is this even correct?? seems to work for web clients...
	else if (/--debug|--inspect/.test(process.execArgv.join(" "))) {
		debugger;
		return;
	} else {
		console.log("Invalid gateway connection! Use a debugger to inspect!");
		return;
	}

	if (process.env.WS_VERBOSE) console.log(`[Gateway] Incomming message: ${JSON.stringify(data)}`);
	if (data.op !== 1) check.call(this, PayloadSchema, data);
	else {
		//custom validation for numbers, because heartbeat
		if (data.s || data.t || (typeof data.d !== "number" && data.d)) {
			console.log("Invalid heartbeat...");
			this.close(CloseCodes.Decode_error);
		}
	}

	// @ts-ignore
	const OPCodeHandler = OPCodeHandlers[data.op];
	if (!OPCodeHandler) {
		console.error("[Gateway] Unkown opcode " + data.op);
		// TODO: if all opcodes are implemented comment this out:
		// this.close(CloseCodes.Unknown_opcode);
		return;
	}

	try {
		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error("[Gateway]", error);
		if (!this.CLOSED && this.CLOSING) return this.close(CloseCodes.Unknown_error);
	}
}
