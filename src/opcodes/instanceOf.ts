import { instanceOf } from "lambert-server";
import { CLOSECODES } from "../util/Constants";
import WebSocket from "../util/WebSocket";

export function check(this: WebSocket, schema: any, data: any) {
	try {
		if (instanceOf(schema, data) !== true) throw "invalid";
	} catch (error) {
		// invalid payload
		this.close(CLOSECODES.Decode_error);
		return false;
	}
}
