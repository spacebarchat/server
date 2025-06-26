import { WebSocket } from "@spacebar/gateway";
import type { WebRtcClient } from "@spacebarchat/spacebar-webrtc-types";

export interface WebRtcWebSocket extends WebSocket {
	type: "guild-voice" | "dm-voice" | "stream";
	webRtcClient?: WebRtcClient<WebRtcWebSocket>;
}
