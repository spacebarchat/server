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
