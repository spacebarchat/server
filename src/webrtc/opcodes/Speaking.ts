import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";
import { transports } from "./SelectProtocol";

// {"speaking":1,"delay":5,"ssrc":2805246727}

export async function onSpeaking(this: WebSocket, data: Payload) {
	this.server!.ws.clients.forEach((c) => {
		const client = c as WebSocket;
		const ssrc = transports.get(client.user_id!)?.getOutgoingStreams()[0].getAudioTracks()[0].getSSRCs().media;

		Send(client, {
			op: VoiceOPCodes.SPEAKING,
			d: {
				user_id: client.user_id,
				speaking: data.d.speaking,
				ssrc: ssrc
			}
		});
	});
}
