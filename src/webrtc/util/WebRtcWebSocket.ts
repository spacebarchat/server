import { WebSocket } from "@spacebar/gateway";
import { WebRtcClient } from "./WebRtcClient";

export interface WebRtcWebSocket extends WebSocket {
	type: "guild-voice" | "dm-voice" | "stream";
	webRtcClient?: WebRtcClient<WebRtcWebSocket>;
}
