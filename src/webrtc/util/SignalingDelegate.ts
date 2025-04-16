import { Codec, WebRtcClient } from "./WebRtcClient";

export interface SignalingDelegate {
	start: () => Promise<void>;
	stop: () => Promise<void>;
	join<T>(
		rtcServerId: string,
		userId: string,
		ws: T,
		type: "guild-voice" | "dm-voice" | "stream",
	): WebRtcClient<T>;
	onOffer<T>(
		client: WebRtcClient<T>,
		offer: string,
		codecs: Codec[],
	): Promise<string>;
	onClientClose<T>(client: WebRtcClient<T>): void;
	updateSDP(offer: string): void;
	getClientsForRtcServer<T>(rtcServerId: string): Set<WebRtcClient<T>>;
	get ip(): string;
	get port(): number;
}
