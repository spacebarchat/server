import { WebSocket } from "@fosscord/webrtc";
import { Message } from "./Message";
import { Session } from "@fosscord/util";

export async function Close(this: WebSocket, code: number, reason: string) {
	console.log("[WebSocket] closed", code, reason);
	if (this.session_id) await Session.delete({ session_id: this.session_id });
	// @ts-ignore
	this.off("message", Message);
}
