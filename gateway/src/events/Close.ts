import WebSocket from "ws";
import { Message } from "./Message";

export function Close(this: WebSocket, code: number, reason: string) {
	// @ts-ignore
	this.off("message", Message);
}
