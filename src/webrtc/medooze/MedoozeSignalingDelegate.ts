import { CodecInfo, MediaInfo, SDPInfo } from "semantic-sdp";
import { SignalingDelegate } from "../util/SignalingDelegate";
import { Codec, WebRtcClient } from "../util/WebRtcClient";
import { MediaServer, Endpoint } from "@dank074/medooze-media-server";
import { VoiceRoom } from "./VoiceRoom";
import { MedoozeWebRtcClient } from "./MedoozeWebRtcClient";

export class MedoozeSignalingDelegate implements SignalingDelegate {
	private _rooms: Map<string, VoiceRoom> = new Map();
	private _ip: string;
	private _port: number;
	private _endpoint: Endpoint;

	public start(): Promise<void> {
		MediaServer.enableLog(true);

		this._ip = process.env.PUBLIC_IP || "127.0.0.1";

		try {
			const range = process.env.WEBRTC_PORT_RANGE || "3690-3960";
			var ports = range.split("-");
			const min = Number(ports[0]);
			const max = Number(ports[1]);

			MediaServer.setPortRange(min, max);
		} catch (error) {
			console.error(
				"Invalid env var: WEBRTC_PORT_RANGE",
				process.env.WEBRTC_PORT_RANGE,
				error,
			);
			process.exit(1);
		}

		//MediaServer.setAffinity(2)
		this._endpoint = MediaServer.createEndpoint(this._ip);
		this._port = this._endpoint.getLocalPort();
		return Promise.resolve();
	}

	public join(
		rtcServerId: string,
		userId: string,
		ws: any,
		type: "guild-voice" | "dm-voice" | "stream",
	): WebRtcClient<any> {
		// make sure user isn't already in a room of the same type
		// user can be in two simultanous rooms of different type though (can be in a voice channel and watching a stream for example)
		const rooms = this.rooms
			.values()
			.filter((room) =>
				type === "stream"
					? room.type === "stream"
					: room.type === "dm-voice" || room.type === "guild-voice",
			);
		let existingClient;

		for (const room of rooms) {
			let result = room.getClientById(userId);
			if (result) {
				existingClient = result;
				break;
			}
		}

		if (existingClient) {
			console.log("client already connected, disconnect..");
			this.onClientClose(existingClient);
		}

		if (!this._rooms.has(rtcServerId)) {
			console.debug("no channel created, creating one...");
			this.createRoom(rtcServerId, type);
		}

		const room = this._rooms.get(rtcServerId)!;

		const client = new MedoozeWebRtcClient(userId, rtcServerId, ws, room);

		room?.onClientJoin(client);

		return client;
	}

	public async onOffer(
		client: WebRtcClient<any>,
		sdpOffer: string,
		codecs: Codec[],
	): Promise<string> {
		const room = this._rooms.get(client.rtc_server_id);

		if (!room) {
			console.error(
				"error, client sent an offer but has not authenticated",
			);
			Promise.reject();
		}

		const offer = SDPInfo.parse("m=audio\n" + sdpOffer);

		const rtpHeaders = new Map(offer.medias[0].extensions);

		const getIdForHeader = (
			rtpHeaders: Map<number, string>,
			headerUri: string,
		) => {
			for (const [key, value] of rtpHeaders) {
				if (value == headerUri) return key;
			}
			return -1;
		};

		const audioMedia = new MediaInfo("0", "audio");
		const audioCodec = new CodecInfo(
			"opus",
			codecs.find((val) => val.name == "opus")?.payload_type ?? 111,
		);
		audioCodec.addParam("minptime", "10");
		audioCodec.addParam("usedtx", "1");
		audioCodec.addParam("useinbandfec", "1");
		audioCodec.setChannels(2);
		audioMedia.addCodec(audioCodec);

		audioMedia.addExtension(
			getIdForHeader(
				rtpHeaders,
				"urn:ietf:params:rtp-hdrext:ssrc-audio-level",
			),
			"urn:ietf:params:rtp-hdrext:ssrc-audio-level",
		);
		if (audioCodec.type === 111)
			// if this is chromium, apply this header
			audioMedia.addExtension(
				getIdForHeader(
					rtpHeaders,
					"http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
				),
				"http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
			);

		const videoMedia = new MediaInfo("1", "video");
		const videoCodec = new CodecInfo(
			"H264",
			codecs.find((val) => val.name == "H264")?.payload_type ?? 102,
		);
		videoCodec.setRTX(
			codecs.find((val) => val.name == "H264")?.rtx_payload_type ?? 103,
		);
		videoCodec.addParam("level-asymmetry-allowed", "1");
		videoCodec.addParam("packetization-mode", "1");
		videoCodec.addParam("profile-level-id", "42e01f");
		videoCodec.addParam("x-google-max-bitrate", "2500");
		videoMedia.addCodec(videoCodec);

		videoMedia.addExtension(
			getIdForHeader(
				rtpHeaders,
				"http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
			),
			"http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
		);
		videoMedia.addExtension(
			getIdForHeader(rtpHeaders, "urn:ietf:params:rtp-hdrext:toffset"),
			"urn:ietf:params:rtp-hdrext:toffset",
		);
		videoMedia.addExtension(
			getIdForHeader(
				rtpHeaders,
				"http://www.webrtc.org/experiments/rtp-hdrext/playout-delay",
			),
			"http://www.webrtc.org/experiments/rtp-hdrext/playout-delay",
		);
		videoMedia.addExtension(
			getIdForHeader(
				rtpHeaders,
				"http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
			),
			"http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
		);

		if (audioCodec.type === 111)
			// if this is chromium, apply this header
			videoMedia.addExtension(
				getIdForHeader(rtpHeaders, "urn:3gpp:video-orientation"),
				"urn:3gpp:video-orientation",
			);

		offer.medias = [audioMedia, videoMedia];

		const transport = this._endpoint.createTransport(offer);

		transport.setRemoteProperties(offer);

		room?.onClientOffer(client, transport);

		const dtls = transport.getLocalDTLSInfo();
		const ice = transport.getLocalICEInfo();
		const fingerprint = dtls.getHash() + " " + dtls.getFingerprint();
		const candidates = transport.getLocalCandidates();
		const candidate = candidates[0];

		const answer =
			`m=audio ${this.port} ICE/SDP\n` +
			`a=fingerprint:${fingerprint}\n` +
			`c=IN IP4 ${this.ip}\n` +
			`a=rtcp:${this.port}\n` +
			`a=ice-ufrag:${ice.getUfrag()}\n` +
			`a=ice-pwd:${ice.getPwd()}\n` +
			`a=fingerprint:${fingerprint}\n` +
			`a=candidate:1 1 ${candidate.getTransport()} ${candidate.getFoundation()} ${candidate.getAddress()} ${candidate.getPort()} typ host\n`;

		return Promise.resolve(answer);
	}

	public onClientClose = (client: WebRtcClient<any>) => {
		this._rooms.get(client.rtc_server_id)?.onClientLeave(client);
	};

	public updateSDP(offer: string): void {
		throw new Error("Method not implemented.");
	}

	public createRoom(
		rtcServerId: string,
		type: "guild-voice" | "dm-voice" | "stream",
	): void {
		this._rooms.set(rtcServerId, new VoiceRoom(rtcServerId, type, this));
	}

	public disposeRoom(rtcServerId: string): void {
		const room = this._rooms.get(rtcServerId);
		room?.dispose();
		this._rooms.delete(rtcServerId);
	}

	get rooms(): Map<string, VoiceRoom> {
		return this._rooms;
	}

	public getClientsForRtcServer(rtcServerId: string): Set<WebRtcClient<any>> {
		if (!this._rooms.has(rtcServerId)) {
			return new Set();
		}

		return new Set(this._rooms.get(rtcServerId)?.clients.values())!;
	}

	private getClientForUserId = (
		userId: string,
	): MedoozeWebRtcClient | undefined => {
		for (const channel of this.rooms.values()) {
			let result = channel.getClientById(userId);
			if (result) {
				return result;
			}
		}
		return undefined;
	};

	get ip(): string {
		return this._ip;
	}
	get port(): number {
		return this._port;
	}

	get endpoint(): Endpoint {
		return this._endpoint;
	}

	public stop(): Promise<void> {
		return Promise.resolve();
	}
}
