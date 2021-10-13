import { WebSocket } from "@fosscord/gateway";
import { Session } from "@fosscord/util";

export async function Close(this: WebSocket, code: number, reason: string) {
	console.log("[WebSocket] closed", code, reason);
	if (this.session_id) await Session.delete({ session_id: this.session_id });
	if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
	if (this.readyTimeout) clearTimeout(this.readyTimeout);

	this.deflate?.close();

	this.removeAllListeners();
}
