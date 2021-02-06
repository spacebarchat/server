import { instanceOf } from "lambert-server";
import { CLOSECODES } from "../util/Constants";
import WebSocket from "../util/WebSocket";

export function check(this: WebSocket, schema: any, data: any) {
	try {
		return instanceOf(schema, data);
	} catch (error) {
		// invalid identify struct
		this.close(CLOSECODES.Decode_error);
		return false;
	}
}
