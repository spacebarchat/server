import { CodecInfo, MediaInfo, SDPInfo } from "semantic-sdp";
import { SignalingDelegate } from "../util/SignalingDelegate";
import { Codec, WebRtcClient } from "../util/WebRtcClient";
import {
	MediaServer,
	IncomingStream,
	OutgoingStream,
	Transport,
	Endpoint,
} from "@dank074/medooze-media-server";
import { VoiceChannel } from "./VoiceChannel";
import { MedoozeWebRtcClient } from "./MedoozeWebRtcClient";

export class MedoozeSignalingDelegate implements SignalingDelegate {
	private _channels: Map<string, VoiceChannel> = new Map();
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

	public join(channelId: string, userId: string, ws: any): WebRtcClient<any> {
		const existingClient = this.getClientForUserId(userId);

		if (existingClient) {
			console.log("client already connected, disconnect..");
			this.onClientClose(existingClient);
		}

		if (!this._channels.has(channelId)) {
			console.debug("no channel created, creating one...");
			this.createChannel(channelId);
		}

		const channel = this._channels.get(channelId)!;

		const client = new MedoozeWebRtcClient(userId, channelId, ws, channel);

		channel?.onClientJoin(client);

		return client;
	}

	public async onOffer(
		client: WebRtcClient<any>,
		sdpOffer: string,
		codecs: Codec[],
	): Promise<string> {
		const channel = this._channels.get(client.channel_id);

		if (!channel) {
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

		channel?.onClientOffer(client, transport);

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
		this._channels.get(client.channel_id)?.onClientLeave(client);
	};

	public updateSDP(offer: string): void {
		throw new Error("Method not implemented.");
	}

	public createChannel(channelId: string): void {
		this._channels.set(channelId, new VoiceChannel(channelId, this));
	}

	public disposeChannelRouter(channelId: string): void {
		this._channels.delete(channelId);
	}

	get channels(): Map<string, VoiceChannel> {
		return this._channels;
	}

	public getClientsForChannel(channelId: string): Set<WebRtcClient<any>> {
		if (!this._channels.has(channelId)) {
			return new Set();
		}

		return new Set(this._channels.get(channelId)?.clients.values())!;
	}

	private getClientForUserId = (
		userId: string,
	): MedoozeWebRtcClient | undefined => {
		for (const channel of this.channels.values()) {
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
