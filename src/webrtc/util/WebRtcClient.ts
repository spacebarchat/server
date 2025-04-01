export interface WebRtcClient<T> {
	websocket: T;
	user_id: string;
	channel_id: string;
	webrtcConnected: boolean;
	getIncomingStreamSSRCs: () => SSRCs;
	getOutgoingStreamSSRCsForUser: (user_id: string) => SSRCs;
	isProducingAudio: () => boolean;
	isProducingVideo: () => boolean;
	publishTrack: (type: "audio" | "video", ssrc: SSRCs) => void;
	subscribeToTrack: (user_id: string, type: "audio" | "video") => void;
}

export interface SSRCs {
	audio_ssrc?: number;
	video_ssrc?: number;
	rtx_ssrc?: number;
}

export interface RtpHeader {
	uri: string;
	id: number;
}

export interface Codec {
	name: "opus" | "VP8" | "VP9" | "H264";
	type: "audio" | "video";
	priority: number;
	payload_type: number;
	rtx_payload_type?: number;
}
