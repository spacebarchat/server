import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index"
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server"

export async function onSpeaking(this: Server, socket: WebSocket, data: Payload) {
}