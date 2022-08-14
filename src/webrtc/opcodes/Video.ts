import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";

/* 
example payload:
{
	audio_ssrc: 0,
	video_ssrc: 0,
	rtx_ssrc: 0,
	streams: [
		{
			type: "video",
			rid: "100",
			ssrc: 97605,
			active: false,
			quality: 100,
			rtx_ssrc: 97606,
			max_bitrate: 2500000,
			max_framerate: 20,
			max_resolution: { type: "fixed", width: 1280, height: 720 },
		},
	],
};
*/

export async function onVideo(this: WebSocket, data: Payload) {
	await Send(this, { op: VoiceOPCodes.MEDIA_SINK_WANTS, d: { any: 100 } });
}
