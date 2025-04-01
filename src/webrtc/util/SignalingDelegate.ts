import { Codec, WebRtcClient } from "./WebRtcClient";

export interface SignalingDelegate {
	start: () => Promise<void>;
	stop: () => Promise<void>;
	join<T>(channelId: string, userId: string, ws: T): WebRtcClient<T>;
	onOffer<T>(
		client: WebRtcClient<T>,
		offer: string,
		codecs: Codec[],
	): Promise<string>;
	onClientClose<T>(client: WebRtcClient<T>): void;
	updateSDP(offer: string): void;
	getClientsForChannel<T>(channelId: string): Set<WebRtcClient<T>>;
	get ip(): string;
	get port(): number;
}
