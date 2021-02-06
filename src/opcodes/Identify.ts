import { CLOSECODES, Payload } from "../util/Constants";
import Config from "../util/Config";
import WebSocket from "../util/WebSocket";
import { checkToken, IdentifySchema } from "discord-server-util";
import { check } from "./instanceOf";

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	if (check.call(this, IdentifySchema, data.d)) return;

	const identify: IdentifySchema = data.d;

	try {
		var { id } = await checkToken(identify.token);
	} catch (error) {
		return this.close(CLOSECODES.Authentication_failed);
	}
}
