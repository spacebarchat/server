import WebSocket from "../util/WebSocket";
import { Message } from "./Message";
import { Session } from "@fosscord/util";

export async function Close(this: WebSocket, code: number, reason: string) {
	await Session.delete({ session_id: this.session_id });
	// @ts-ignore
	this.off("message", Message);
}
