import { Server as WebSocketServer } from "ws";
import { WebSocket, CLOSECODES } from "@fosscord/gateway";
import { Config, initDatabase } from "@fosscord/util";
import OPCodeHandlers, { Payload } from "./opcodes";
import { setHeartbeat } from "./util";
import * as mediasoup from "mediasoup";
import { types as MediasoupTypes } from "mediasoup";
import udp from "dgram";
import sodium from "libsodium-wrappers";

var port = Number(process.env.PORT);
if (isNaN(port)) port = 3004;

export class Server {
	public ws: WebSocketServer;
	public mediasoupWorkers: MediasoupTypes.Worker[] = [];
	public mediasoupRouters: MediasoupTypes.Router[] = [];
	public mediasoupTransports: MediasoupTypes.WebRtcTransport[] = [];
	public mediasoupProducers: MediasoupTypes.Producer[] = [];
	public mediasoupConsumers: MediasoupTypes.Consumer[] = [];

	public decryptKey: number[] = [];
	public testUdp = udp.createSocket("udp6");

	constructor() {
		this.ws = new WebSocketServer({
			port,
			maxPayload: 4096,
		});
		this.ws.on("connection", async (socket: WebSocket) => {
			await setHeartbeat(socket);

			socket.on("message", async (message: string) => {
				const payload: Payload = JSON.parse(message);

				if (OPCodeHandlers[payload.op])
					try {
						await OPCodeHandlers[payload.op].call(this, socket, payload);
					}
					catch (e) {
						console.error(e);
						socket.close(CLOSECODES.Unknown_error);
					}
				else {
					console.error(`Unimplemented`, payload);
					socket.close(CLOSECODES.Unknown_opcode);
				}
			});
		});

		this.testUdp.bind(50001);
		this.testUdp.on("message", (msg, rinfo) => {
			//random key from like, the libsodium examples on npm lol

			//give me my remote port?
			if (sodium.to_hex(msg) == "0001004600000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000") {
				this.testUdp.send(Buffer.from([rinfo.port, 0]), rinfo.port, rinfo.address);
				console.log(`got magic packet to send remote port? ${rinfo.address}:${rinfo.port}`);
				return;
			}

			//Hello
			if (sodium.to_hex(msg) == "0100000000000000") {
				console.log(`[UDP] client helloed`);
				return;
			}

			const nonce = Buffer.concat([msg.slice(-4), Buffer.from("\x00".repeat(20))]);
			console.log(`[UDP] nonce for this message: ${nonce.toString("hex")}`);

			console.log(`[UDP] message: ${sodium.to_hex(msg)}`);

			let encrypted;
			if (msg.slice(0, 2).indexOf("\x81\xc9") == 0) {
				encrypted = msg.slice(0x18, -4);
			}
			else if (msg.slice(0, 2).indexOf("\x90\x78") == 0) {
				encrypted = msg.slice(0x1C, -4);
			}
			else {
				encrypted = msg.slice(0x18, -4);
				console.log(`wtf header received: ${encrypted.toString("hex")}`);
			}

			if (sodium.to_hex(msg).indexOf("80c8000600000001") == 0) {
				//call status

				try {
					const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonce, Uint8Array.from(this.decryptKey));
					console.log("[UDP] [ call status ]" + decrypted);
				}
				catch (e) {
					console.error(`[UDP] decrypt failure\n${e}\n${encrypted.toString("base64")}`);
				}
				return;
			}

			try {
				const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonce, Uint8Array.from(this.decryptKey));
				console.log("[UDP] " + decrypted);
			}
			catch (e) {
				console.error(`[UDP] decrypt failure\n${e}\n${msg.toString("base64")}`);
			}
		});
	}

	async listen(): Promise<void> {
		// @ts-ignore
		await initDatabase();
		await Config.init();
		//await this.createWorkers();
		console.log("[DB] connected");
		console.log(`[WebRTC] online on 0.0.0.0:${port}`);
	}

	async createWorkers(): Promise<void> {
		const numWorkers = 1;
		for (let i = 0; i < numWorkers; i++) {
			const worker = await mediasoup.createWorker({ logLevel: "debug", logTags: ["dtls", "ice", "info", "message", "bwe"] });
			if (!worker) return;

			worker.on("died", () => {
				console.error("mediasoup worker died");
			});

			worker.observer.on("newrouter", async (router: MediasoupTypes.Router) => {
				console.log("new router created [id:%s]", router.id);

				this.mediasoupRouters.push(router);

				router.observer.on("newtransport", async (transport: MediasoupTypes.WebRtcTransport) => {
					console.log("new transport created [id:%s]", transport.id);

					await transport.enableTraceEvent();

					transport.on('dtlsstatechange', (dtlsstate) => {
						console.log(dtlsstate);
					});

					transport.on("sctpstatechange", (sctpstate) => {
						console.log(sctpstate);
					});

					router.observer.on("newrtpobserver", (rtpObserver: MediasoupTypes.RtpObserver) => {
						console.log("new RTP observer created [id:%s]", rtpObserver.id);

						// rtpObserver.observer.on("")
					});

					transport.on("connect", () => {
						console.log("transport connect");
					});

					transport.observer.on("newproducer", (producer: MediasoupTypes.Producer) => {
						console.log("new producer created [id:%s]", producer.id);

						this.mediasoupProducers.push(producer);
					});

					transport.observer.on("newconsumer", (consumer: MediasoupTypes.Consumer) => {
						console.log("new consumer created [id:%s]", consumer.id);

						this.mediasoupConsumers.push(consumer);

						consumer.on("rtp", (rtpPacket) => {
							console.log(rtpPacket);
						});
					});

					transport.observer.on("newdataproducer", (dataProducer) => {
						console.log("new data producer created [id:%s]", dataProducer.id);
					});

					transport.on("trace", (trace) => {
						console.log(trace);
					});

					this.mediasoupTransports.push(transport);
				});
			});

			await worker.createRouter({
				mediaCodecs: [
					{
						kind: "audio",
						mimeType: "audio/opus",
						clockRate: 48000,
						channels: 2,
						preferredPayloadType: 111,
					},
				],
			});

			this.mediasoupWorkers.push(worker);
		}
	}
}
