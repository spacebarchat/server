import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { Server } from "../Server"

export async function onConnect(this: Server, socket: WebSocket, data: Payload) {
}