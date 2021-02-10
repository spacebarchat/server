import { CLOSECODES, Payload } from "../util/Constants";
import WebSocket from "../util/WebSocket";
import { checkToken } from "fosscord-server-util";
import { setupListener } from "../listener/listener";
import { instanceOf } from "lambert-server";
import { IdentifySchema } from "../schema/Identify";

export async function onIdentify(this: WebSocket, data: Payload) {
	try {
		clearTimeout(this.readyTimeout);
		instanceOf(IdentifySchema, data.d);

		const identify: IdentifySchema = data.d;

		var decoded = await checkToken(identify.token);
		this.userid = decoded.id;

		await setupListener.call(this);
	} catch (error) {
		return this.close(CLOSECODES.Authentication_failed);
	}
}
