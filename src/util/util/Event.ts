/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Channel } from "amqplib";
import { RabbitMQ } from "./RabbitMQ";
import EventEmitter from "events";
import { EVENT, Event } from "../interfaces";
import { randomUUID } from "crypto";
import path from "path";
import { Socket } from "node:net";
import { FSWatcher } from "node:fs";
import { Stopwatch } from "./Stopwatch";
import { Config } from "./Config";
export const events = new EventEmitter();
let unixSocketListener: UnixSocketListener | null = null;
let unixSocketWriter: UnixSocketWriter | null = null;

export async function emitEvent(payload: Omit<Event, "created_at">) {
	const id = (payload.guild_id || payload.channel_id || payload.user_id) as string;
	if (!id) return console.error("event doesn't contain any id", payload);

	if (RabbitMQ.connection) {
		const data = typeof payload.data === "object" ? JSON.stringify(payload.data) : payload.data; // use rabbitmq for event transmission
		const channel = await RabbitMQ.getSafeChannel();
		try {
			await channel.assertExchange(id, "fanout", {
				durable: false,
			});

			// assertQueue isn't needed, because a queue will automatically created if it doesn't exist
			const successful = channel.publish(id, "", Buffer.from(`${data}`), { type: payload.event });
			if (!successful) throw new Error("failed to send event");
		} catch (e) {
			// todo: should we retry publishng the event?
			console.log("[RabbitMQ] ", e);
		}
	} else if (process.env.EVENT_TRANSMISSION === "unix" && process.env.EVENT_SOCKET_PATH) {
		if (!unixSocketWriter) {
			unixSocketWriter = new UnixSocketWriter(process.env.EVENT_SOCKET_PATH);
			await unixSocketWriter.init();
		}
		await unixSocketWriter.emit(payload);
	} else if (process.env.EVENT_TRANSMISSION === "process") {
		process.send?.({ type: "event", event: payload, id } as ProcessEvent);
	} else {
		events.emit(id, payload);
	}
}

export async function initEvent() {
	await RabbitMQ.init(); // does nothing if rabbitmq is not setup
	if (RabbitMQ.connection) {
		// empty on purpose?
	} else {
		// use event emitter
		// use process messages
	}

	await listenEvent("spacebar", async (event) => {
		console.log("[Event] Received spacebar event:", event);
		if ((event.event as string) === "SB_RELOAD_CONFIG") {
			console.log("[Event] Reloading config due to RELOAD_CONFIG event");
			await Config.init(true);
		}
	});
}

export interface EventOpts extends Event {
	acknowledge?: () => unknown;
	channel?: Channel;
	cancel: (id?: string) => unknown;
}

export interface ListenEventOpts {
	channel?: Channel;
	acknowledge?: boolean;
}

export interface ProcessEvent {
	type: "event";
	event: Event;
	id: string;
}

export async function listenEvent(event: string, callback: (event: EventOpts) => unknown, opts?: ListenEventOpts): Promise<() => Promise<void>> {
	if (RabbitMQ.connection) {
		const rabbitMQChannel = await RabbitMQ.getSafeChannel();
		const channel = opts?.channel || rabbitMQChannel;
		if (!channel) throw new Error("[Events] An event was sent without an associated channel");
		return await rabbitListen(channel, event, callback, {
			acknowledge: opts?.acknowledge,
		});
	} else if (process.env.EVENT_TRANSMISSION === "unix" && process.env.EVENT_SOCKET_PATH) {
		if (!unixSocketListener) {
			unixSocketListener = new UnixSocketListener(path.join(process.env.EVENT_SOCKET_PATH, `${process.pid}.sock`));
			await unixSocketListener.init();
		}
		return await unixSocketListener.listen(event, callback);
	} else if (process.env.EVENT_TRANSMISSION === "process") {
		const cancel = async () => {
			process.removeListener("message", listener);
			process.setMaxListeners(process.getMaxListeners() - 1);
		};

		const listener = (msg: ProcessEvent) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			msg.type === "event" && msg.id === event && callback({ ...msg.event, cancel });
		};

		// TODO: assert the type is correct?
		process.addListener("message", (msg) => listener(msg as ProcessEvent));
		process.setMaxListeners(process.getMaxListeners() + 1);

		return cancel;
	} else {
		const listener = (opts: EventOpts) => callback({ ...opts, cancel });
		const cancel = async () => {
			events.removeListener(event, listener);
			events.setMaxListeners(events.getMaxListeners() - 1);
		};
		events.setMaxListeners(events.getMaxListeners() + 1);
		events.addListener(event, listener);

		return cancel;
	}
}

async function rabbitListen(channel: Channel, id: string, callback: (event: EventOpts) => unknown, opts?: { acknowledge?: boolean }): Promise<() => Promise<void>> {
	await channel.assertExchange(id, "fanout", { durable: false });
	const q = await channel.assertQueue("", {
		exclusive: true,
		autoDelete: true,
	});

	const consumerTag = randomUUID();

	const cancel = async () => {
		await channel.cancel(consumerTag);
		await channel.unbindQueue(q.queue, id, "");
	};

	await channel.bindQueue(q.queue, id, "");
	await channel.consume(
		q.queue,
		(opts) => {
			if (!opts) return;

			const data = JSON.parse(opts.content.toString());
			const event = opts.properties.type as EVENT;

			callback({
				event,
				data,
				acknowledge() {
					channel.ack(opts);
				},
				channel,
				cancel,
			});
			// rabbitCh.ack(opts);
		},
		{
			noAck: !opts?.acknowledge,
			consumerTag: consumerTag,
		},
	);

	return cancel;
}

class UnixSocketListener {
	eventEmitter: EventEmitter;
	socketPath: string;

	constructor(socketPath: string) {
		this.eventEmitter = new EventEmitter();
		this.socketPath = socketPath;
	}

	async init() {
		const net = await import("net");
		const server = net.createServer((socket) => {
			socket.on("connect", () => {
				console.log("[Events] Unix socket client connected");
			});
			let buffer = Buffer.alloc(0);
			socket.on("data", (data: Buffer) => {
				buffer = Buffer.concat([buffer, data]);
				while (buffer.length >= 4) {
					const msgLen = buffer.readUInt32BE(0);
					if (buffer.length < 4 + msgLen) break;
					const msgBuf = buffer.slice(4, 4 + msgLen);
					buffer = buffer.slice(4 + msgLen);
					try {
						const payload = JSON.parse(msgBuf.toString());
						this.eventEmitter.emit(payload.id, payload.event);
					} catch (e) {
						console.error("[Events] Failed to parse unix socket data:", e);
					}
				}
			});
			socket.on("error", (err) => {
				console.error("[Events] Unix socket error:", err);
			});
			socket.on("close", () => {
				console.log("[Events] Unix socket client disconnected");
			});
		});

		server.listen(this.socketPath, () => {
			console.log(`Unix socket server listening on ${this.socketPath}`);
		});

		const shutdown = () => {
			console.log("[Events] Closing unix socket server");
			server.close();
			process.exit(0);
		};
		for (const sig of ["SIGINT", "SIGTERM", "SIGQUIT"] as const) {
			process.on(sig, shutdown);
		}
	}

	async listen(event: string, callback: (event: EventOpts) => unknown): Promise<() => Promise<void>> {
		const listener = (data: Event) => {
			callback({
				...data,
				cancel,
			});
		};

		this.eventEmitter.addListener(event, listener);

		const cancel = async () => {
			this.eventEmitter.removeListener(event, listener);
			this.eventEmitter.setMaxListeners(this.eventEmitter.getMaxListeners() - 1);
		};

		this.eventEmitter.setMaxListeners(this.eventEmitter.getMaxListeners() + 1);

		return cancel;
	}
}

class UnixSocketWriter {
	socketPath: string;
	clients: { [key: string]: Socket } = {};
	watcher: FSWatcher;

	constructor(socketPath: string) {
		this.socketPath = socketPath;
	}

	async init() {
		const net = await import("net");
		const fs = await import("fs");

		if (!fs.opendirSync(this.socketPath)) throw new Error("Unix socket path does not exist or is not a directory: " + this.socketPath);

		console.log("[Events] Unix socket writer initializing for", this.socketPath);

		const connect = (file: string) => {
			const fullPath = path.join(this.socketPath, file);
			this.clients[fullPath] = net.createConnection(fullPath, () => {
				console.log("[Events] Unix socket client connected to", fullPath);
			});

			this.clients[fullPath].on("error", (err) => {
				console.error("[Events] Unix socket client error on", fullPath, ":", err);
			});
		};

		// connect to all sockets, now and in the future
		this.watcher = fs.watch(this.socketPath, {}, (eventType, filename) => {
			console.log("[Events] Unix socket writer received watch sig", eventType, filename);
			connect(filename!);
		});

		// connect to existing sockets if any
		fs.readdir(this.socketPath, (err, files) => {
			if (err) return console.error("[Events] Unix socket writer failed to read directory:", err);

			console.log("[Events] Unix socket writer found existing sockets:", files);
			files.forEach((file) => {
				connect(file);
			});
		});
	}

	async emit(event: Event) {
		if (!this.clients) throw new Error("UnixSocketWriter not initialized");

		const tsw = Stopwatch.startNew();
		const payloadBuf = Buffer.from(JSON.stringify({ id: (event.guild_id || event.channel_id || event.user_id) as string, event }));
		const lenBuf = Buffer.alloc(4);
		lenBuf.writeUInt32BE(payloadBuf.length, 0);
		const framed = Buffer.concat([lenBuf, payloadBuf]);
		for (const socket of Object.entries(this.clients)) {
			if (socket[1].destroyed) {
				console.log("[Events] Unix socket writer found destroyed socket, removing:", socket[0]);
				delete this.clients[socket[0]];
				continue;
			}

			try {
				socket[1].write(framed);
			} catch (e) {
				console.error("[Events] Unix socket writer failed to write to socket", socket[0], ":", e);
			}
		}

		console.log(`[Events] Unix socket writer emitted to ${Object.entries(this.clients).length} sockets in ${tsw.elapsed().totalMilliseconds}ms`);
	}
}
