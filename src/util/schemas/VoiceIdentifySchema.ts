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