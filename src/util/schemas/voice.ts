export interface VoiceVideoSchema {
	audio_ssrc: number;
	video_ssrc: number;
	rtx_ssrc?: number;
	user_id?: string;
	streams?: {
		type: "video" | "audio";
		rid: string;
		ssrc: number;
		active: boolean;
		quality: number;
		rtx_ssrc: number;
		max_bitrate: number;
		max_framerate: number;
		max_resolution: { type: string; width: number; height: number; };
	}[];
}

export const VoiceStateUpdateSchema = {
	$guild_id: String,
	$channel_id: String,
	self_mute: Boolean,
	self_deaf: Boolean,
	self_video: Boolean
};

//TODO need more testing when community guild and voice stage channel are working
export interface VoiceStateUpdateSchema {
	channel_id: string;
	guild_id?: string;
	suppress?: boolean;
	request_to_speak_timestamp?: Date;
	self_mute?: boolean;
	self_deaf?: boolean;
	self_video?: boolean;
}

export interface VoiceIdentifySchema {
	server_id: string;
	user_id: string;
	session_id: string;
	token: string;
	video?: boolean;
	streams?: {
		type: string;
		rid: string;
		quality: number;
	}[];
}

export interface SelectProtocolSchema {
	protocol: "webrtc" | "udp";
	data:
	| string
	| {
		address: string;
		port: number;
		mode: string;
	};
	sdp?: string;
	codecs?: {
		name: "opus" | "VP8" | "VP9" | "H264";
		type: "audio" | "video";
		priority: number;
		payload_type: number;
		rtx_payload_type?: number | null;
	}[];
	rtc_connection_id?: string; // uuid
}