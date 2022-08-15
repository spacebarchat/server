import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { validateSchema, VoiceVideoSchema } from "@fosscord/util";
import { VoiceOPCodes } from "../util";
import SemanticSDP from "semantic-sdp";
import MediaServer, { IncomingStream, OutgoingStream, SSRCs, Transport } from "medooze-media-server";
import path from "path";
import { endpoint, transports } from "./SelectProtocol";

export async function onVideo(this: WebSocket, payload: Payload) {
	if (!this.transport) return;
	if (!this.ssrc) return;
	const d = validateSchema("VoiceVideoSchema", payload.d) as VoiceVideoSchema;

	await Send(this, { op: VoiceOPCodes.MEDIA_SINK_WANTS, d: { any: 100 } });

	const id = "stream" + this.user_id;

	var stream = this.transport.getIncomingStream(id);
	if (!stream) {
		stream = this.transport.createIncomingStream(
			SemanticSDP.StreamInfo.expand({
				id,
				tracks: []
			})
		);

		const interval = setInterval(() => {
			for (const track of stream.getTracks()) {
				for (const layer of Object.values(track.getStats())) {
					console.log(track.getId(), layer.total);
				}
			}
		}, 5000);

		stream.on("stopped", () => {
			console.log("stream stopped");
			clearInterval(interval);
		});
		this.transport.on("stopped", () => {
			stream.stop();
		});
		this.on("close", () => {
			this.transport!.stop();
		});
		const out = this.transport.createOutgoingStream(
			SemanticSDP.StreamInfo.expand({
				id: "out" + this.user_id,
				tracks: []
			})
		);

		transports.forEach((t, user_id) => {
			if (user_id === this.user_id) return;

			const inStream = t.getIncomingStreams()[0];
			if (!inStream) return console.error("no incoming stream");

			out.attachTo(inStream);

			Send(this, {
				op: VoiceOPCodes.SPEAKING,
				d: {
					user_id: user_id,
					speaking: 1,
					ssrc: out.getAudioTracks()?.[0]?.getSSRCs().media!
				}
			});
		});
	}

	if (d.audio_ssrc) {
		handleSSRC.call(this, { type: "audio", stream }, { media: d.audio_ssrc, rtx: d.audio_ssrc + 1 });
	}
	if (d.video_ssrc && d.rtx_ssrc) {
		handleSSRC.call(this, { type: "video", stream }, { media: d.video_ssrc, rtx: d.rtx_ssrc });
	}
}

function handleSSRC(this: WebSocket, opts: { type: "audio" | "video"; stream: IncomingStream }, ssrcs: SSRCs) {
	const id = opts.type + ssrcs.media;
	var track = opts.stream.getTrack(id);
	if (!track) {
		console.log("createIncomingStreamTrack", id);
		track = this.transport!.createIncomingStreamTrack(opts.type, { id, ssrcs });
		opts.stream.addTrack(track);

		if (opts.type === "video") {
			const recorder = MediaServer.createRecorder(path.join(__dirname, "..", "..", "..", id + ".mp4"), {
				waitForIntra: true,
				refresh: 1000
			});
			recorder.record(opts.stream);

			opts.stream.on("stopped", () => {
				recorder.stop();
			});
		}

		transports.forEach((t, user_id) => {
			if (user_id === this.user_id) return;

			const out = t.getOutgoingStreams()[0];
			if (!out) return console.error("no outgoing stream");

			const outTrack = t.createOutgoingStreamTrack(opts.type);
			outTrack.attachTo(track);
			out.addTrack(outTrack);
			console.log("attach track", user_id, outTrack);

			Send(this, {
				op: VoiceOPCodes.SPEAKING,
				d: {
					user_id: user_id,
					speaking: 1,
					ssrc: outTrack.getSSRCs().media!
				}
			});
		});
	}
}
