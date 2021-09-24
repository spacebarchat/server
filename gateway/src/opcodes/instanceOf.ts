import { instanceOf } from "lambert-server";
import { WebSocket, CLOSECODES } from "@fosscord/gateway";

export function check(this: WebSocket, schema: any, data: any) {
	try {
		const error = instanceOf(schema, data, { path: "body" });
		if (error !== true) {
			throw error;
		}
		return true;
	} catch (error) {
		console.error(error);
		// invalid payload
		this.close(CLOSECODES.Decode_error);
		throw error;
	}
}
