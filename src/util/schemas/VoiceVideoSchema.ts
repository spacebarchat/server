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