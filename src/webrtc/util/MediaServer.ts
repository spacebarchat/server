import SemanticSDP from "semantic-sdp";
import MediaServer, { IncomingStream, OutgoingStream, SSRCs, Transport } from "medooze-media-server";
import { WebSocket } from "@fosscord/gateway";
MediaServer.enableLog(true);

export const PublicIP = "192.168.178.21";

export const endpoint = MediaServer.createEndpoint(PublicIP);

export const channels = new Map<string, Set<Client>>();

export interface Client {
	transport?: Transport;
	websocket: WebSocket;
	out: {
		stream?: OutgoingStream;
		tracks: Map<
			string,
			{
				audio_ssrc: number;
				video_ssrc: number;
				rtx_ssrc: number;
			}
		>;
	};
	in: {
		stream?: IncomingStream;
		audio_ssrc: number;
		video_ssrc: number;
		rtx_ssrc: number;
	};
	sdp: SemanticSDP.SDPInfo;
	channel_id: string;
}

export function getClients(channel_id: string) {
	if (!channels.has(channel_id)) channels.set(channel_id, new Set());
	return channels.get(channel_id)!;
}
