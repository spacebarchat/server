import { Payload, WebSocket } from "@fosscord/gateway";
import OPCodeHandlers from "../opcodes";
import { check } from "../opcodes/instanceOf";
import { CLOSECODES } from "../util/Constants";
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
	let data: Payload;

	if (this.encoding === "etf" && buffer instanceof Buffer)
		data = erlpack.unpack(buffer);
	else if (this.encoding === "json") {
		if(this.inflate) {
			// TODO: for some reason, this seems to still have a tendency to throw an unhandled exception, this is here because not all payloads seem to be compressed.
			try {
				buffer = this.inflate.process(buffer) as any;
			} catch {
				buffer = buffer.toString() as any;
			}
		}
		data = JSON.parse(buffer as unknown as string); //TODO: is this even correct?? seems to work for web clients...
	}
	else if(/--debug|--inspect/.test(process.execArgv.join(' '))) {
		debugger;
		return;
	} else {
		console.log("Invalid gateway connection! Use a debugger to inspect!");
		return;
	}

	if (process.env.WS_VERBOSE) console.log(`[Websocket] Incomming message: ${JSON.stringify(data)}`);
	if (data.op !== 1) check.call(this, PayloadSchema, data);
	else {
		//custom validation for numbers, because heartbeat
		if (data.s || data.t || (typeof data.d !== "number" && data.d)) {
			console.log("Invalid heartbeat...");
			this.close(CLOSECODES.Decode_error);
		}
	}

	// @ts-ignore
	const OPCodeHandler = OPCodeHandlers[data.op];
	if (!OPCodeHandler) {
		console.error("[Gateway] Unkown opcode " + data.op);
		// TODO: if all opcodes are implemented comment this out:
		// this.close(CLOSECODES.Unknown_opcode);
		return;
	}

	try {
		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error(error);
		if (!this.CLOSED && this.CLOSING) return this.close(CLOSECODES.Unknown_error);
	}
}
