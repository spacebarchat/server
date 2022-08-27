import { Payload, WebSocket } from "@fosscord/gateway";
import { Send } from "../util/Send";

export async function onVoiceServerPing(this: WebSocket, data: Payload) {
	console.log("Got voice server ping: ", data, "Doing a noop!");
	

	// return this.close(CloseCodes.Invalid_session);
}
