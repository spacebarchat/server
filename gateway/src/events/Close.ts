import WebSocket from "ws";
import { Message } from "./Message";

export function Close(this: WebSocket, code: number, reason: string) {
	this.off("message", Message);
}
