import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { getClients, VoiceOPCodes } from "../util";

// {"speaking":1,"delay":5,"ssrc":2805246727}

export async function onSpeaking(this: WebSocket, data: Payload) {
	if (!this.client) return;

	getClients(this.client.channel_id).forEach((client) => {
		if (client === this.client) return;
		const ssrc = this.client!.out.tracks.get(client.websocket.user_id);

		Send(client.websocket, {
			op: VoiceOPCodes.SPEAKING,
			d: {
				user_id: client.websocket.user_id,
				speaking: data.d.speaking,
				ssrc: ssrc?.audio_ssrc || 0
			}
		});
	});
}