import { MedoozeSignalingDelegate } from "./MedoozeSignalingDelegate";
import {
	IncomingStreamTrack,
	SSRCs,
	Transport,
} from "@dank074/medooze-media-server";
import { MedoozeWebRtcClient } from "./MedoozeWebRtcClient";
import { StreamInfo } from "semantic-sdp";

export class VoiceRoom {
	private _clients: Map<string, MedoozeWebRtcClient>;
	private _id: string;
	private _sfu: MedoozeSignalingDelegate;
	private _type: "guild-voice" | "dm-voice" | "stream";

	constructor(
		id: string,
		type: "guild-voice" | "dm-voice" | "stream",
		sfu: MedoozeSignalingDelegate,
	) {
		this._id = id;
		this._type = type;
		this._clients = new Map();
		this._sfu = sfu;
	}

	onClientJoin = (client: MedoozeWebRtcClient) => {
		// do shit here
		this._clients.set(client.user_id, client);
	};

	onClientOffer = (client: MedoozeWebRtcClient, transport: Transport) => {
		client.transport = transport;

		client.transport.on("dtlsstate", (state, self) => {
			if (state === "connected") {
				client.webrtcConnected = true;
				console.log("connected");
			}
		});

		client.incomingStream = transport.createIncomingStream(
			new StreamInfo(`in-${client.user_id}`),
		);

		client.outgoingStream = transport.createOutgoingStream(
			new StreamInfo(`out-${client.user_id}`),
		);

		client.webrtcConnected = true;

		// subscribe to all current streams from this channel
		// for(const otherClient of this._clients.values()) {
		//     const incomingStream = otherClient.incomingStream

		//     if(!incomingStream) continue;

		//     for(const track of (incomingStream.getTracks())) {
		//         client.subscribeToTrack(otherClient.user_id, track.media)
		//     }
		// }
	};

	onClientLeave = (client: MedoozeWebRtcClient) => {
		console.log("stopping client");
		this._clients.delete(client.user_id);

		// stop the client
		if (!client.isStopped) {
			client.isStopped = true;

			for (const otherClient of this.clients.values()) {
				//remove outgoing track for this user
				otherClient.outgoingStream
					?.getTrack(`audio-${client.user_id}`)
					?.stop();
				otherClient.outgoingStream
					?.getTrack(`video-${client.user_id}`)
					?.stop();
			}

			client.incomingStream?.stop();
			client.outgoingStream?.stop();

			client.transport?.stop();
			client.room = undefined;
			client.incomingStream = undefined;
			client.outgoingStream = undefined;
			client.transport = undefined;
			client.websocket = undefined;
		}
	};

	get clients(): Map<string, MedoozeWebRtcClient> {
		return this._clients;
	}

	getClientById = (id: string) => {
		return this._clients.get(id);
	};

	get id(): string {
		return this._id;
	}

	get type(): "guild-voice" | "dm-voice" | "stream" {
		return this._type;
	}

	public dispose(): void {
		const clients = this._clients.values();
		for (const client of clients) {
			this.onClientLeave(client);
		}
		this._clients.clear();
		this._sfu = undefined!;
		this._clients = undefined!;
	}
}
