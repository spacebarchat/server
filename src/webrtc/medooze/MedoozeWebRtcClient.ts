import {
	IncomingStream,
	OutgoingStream,
	Transport,
} from "@dank074/medooze-media-server";
import { SSRCs, WebRtcClient } from "webrtc/util";
import { VoiceChannel } from "./VoiceChannel";

export class MedoozeWebRtcClient implements WebRtcClient<any> {
	websocket: any;
	user_id: string;
	channel_id: string;
	webrtcConnected: boolean;
	public transport?: Transport;
	public incomingStream?: IncomingStream;
	public outgoingStream?: OutgoingStream;
	public channel?: VoiceChannel;
	public isStopped?: boolean;

	constructor(
		userId: string,
		channelId: string,
		websocket: any,
		channel: VoiceChannel,
	) {
		this.user_id = userId;
		this.channel_id = channelId;
		this.websocket = websocket;
		this.channel = channel;
		this.webrtcConnected = false;
		this.isStopped = false;
	}

	public isProducingAudio(): boolean {
		if (!this.webrtcConnected) return false;
		const audioTrack = this.incomingStream?.getTrack(
			`audio-${this.user_id}`,
		);

		if (audioTrack) return true;

		return false;
	}

	public isProducingVideo(): boolean {
		if (!this.webrtcConnected) return false;
		const videoTrack = this.incomingStream?.getTrack(
			`video-${this.user_id}`,
		);

		if (videoTrack) return true;

		return false;
	}

	public getIncomingStreamSSRCs(): SSRCs {
		if (!this.webrtcConnected)
			return { audio_ssrc: 0, video_ssrc: 0, rtx_ssrc: 0 };

		const audioTrack = this.incomingStream?.getTrack(
			`audio-${this.user_id}`,
		);
		const audio_ssrc =
			audioTrack?.getSSRCs()[audioTrack.getDefaultEncoding().id];
		const videoTrack = this.incomingStream?.getTrack(
			`video-${this.user_id}`,
		);
		const video_ssrc =
			videoTrack?.getSSRCs()[videoTrack.getDefaultEncoding().id];

		return {
			audio_ssrc: audio_ssrc?.media ?? 0,
			video_ssrc: video_ssrc?.media ?? 0,
			rtx_ssrc: video_ssrc?.rtx ?? 0,
		};
	}

	public getOutgoingStreamSSRCsForUser(user_id: string): SSRCs {
		const outgoingStream = this.outgoingStream;

		const audioTrack = outgoingStream?.getTrack(`audio-${user_id}`);
		const audio_ssrc = audioTrack?.getSSRCs();
		const videoTrack = outgoingStream?.getTrack(`video-${user_id}`);
		const video_ssrc = videoTrack?.getSSRCs();

		return {
			audio_ssrc: audio_ssrc?.media ?? 0,
			video_ssrc: video_ssrc?.media ?? 0,
			rtx_ssrc: video_ssrc?.rtx ?? 0,
		};
	}

	public publishTrack(type: "audio" | "video", ssrc: SSRCs) {
		if (!this.transport) return;

		const id = `${type}-${this.user_id}`;
		const existingTrack = this.incomingStream?.getTrack(id);

		if (existingTrack) {
			console.error(`error: attempted to create duplicate track ${id}`);
			return;
		}
		let ssrcs;
		if (type === "audio") {
			ssrcs = { media: ssrc.audio_ssrc! };
		} else {
			ssrcs = { media: ssrc.video_ssrc!, rtx: ssrc.rtx_ssrc };
		}
		const track = this.transport?.createIncomingStreamTrack(
			type,
			{ id, ssrcs: ssrcs, media: type },
			this.incomingStream,
		);

		//this.channel?.onClientPublishTrack(this, track, ssrcs);
	}

	public subscribeToTrack(user_id: string, type: "audio" | "video") {
		if (!this.transport) return;

		const id = `${type}-${user_id}`;

		const otherClient = this.channel?.getClientById(user_id);
		const incomingStream = otherClient?.incomingStream;
		const incomingTrack = incomingStream?.getTrack(id);

		if (!incomingTrack) {
			console.error(`error subscribing, not track found ${id}`);
			return;
		}

		let ssrcs;
		if (type === "audio") {
			ssrcs = {
				media: otherClient?.getIncomingStreamSSRCs().audio_ssrc!,
			};
		} else {
			ssrcs = {
				media: otherClient?.getIncomingStreamSSRCs().video_ssrc!,
				rtx: otherClient?.getIncomingStreamSSRCs().rtx_ssrc,
			};
		}

		const outgoingTrack = this.transport?.createOutgoingStreamTrack(
			incomingTrack.media,
			{ id, ssrcs, media: incomingTrack.media },
			this.outgoingStream,
		);

		outgoingTrack?.attachTo(incomingTrack);
	}
}
