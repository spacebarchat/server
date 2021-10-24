import { Channel } from "amqplib";
import { RabbitMQ } from "./RabbitMQ";
import EventEmitter from "events";
import { EVENT, Event } from "../interfaces";
export const events = new EventEmitter();

export async function emitEvent(payload: Omit<Event, "created_at">) {
	const id = (payload.channel_id || payload.user_id || payload.guild_id) as string;
	if (!id) return console.error("event doesn't contain any id", payload);

	if (RabbitMQ.connection) {
		const data = typeof payload.data === "object" ? JSON.stringify(payload.data) : payload.data; // use rabbitmq for event transmission
		await RabbitMQ.channel?.assertExchange(id, "fanout", { durable: false });

		// assertQueue isn't needed, because a queue will automatically created if it doesn't exist
		const successful = RabbitMQ.channel?.publish(id, "", Buffer.from(`${data}`), { type: payload.event });
		if (!successful) throw new Error("failed to send event");
	} else if (process.env.EVENT_TRANSMISSION === "process") {
		process.send?.({ type: "event", event: payload, id } as ProcessEvent);
	} else {
		events.emit(id, payload);
	}
}

export async function initEvent() {
	await RabbitMQ.init(); // does nothing if rabbitmq is not setup
	if (RabbitMQ.connection) {
	} else {
		// use event emitter
		// use process messages
	}
}

export interface EventOpts extends Event {
	acknowledge?: Function;
	channel?: Channel;
	cancel: Function;
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

export async function listenEvent(event: string, callback: (event: EventOpts) => any, opts?: ListenEventOpts) {
	if (RabbitMQ.connection) {
		// @ts-ignore
		return rabbitListen(opts?.channel || RabbitMQ.channel, event, callback, { acknowledge: opts?.acknowledge });
	} else if (process.env.EVENT_TRANSMISSION === "process") {
		const cancel = () => {
			process.removeListener("message", listener);
			process.setMaxListeners(process.getMaxListeners() - 1);
		};

		const listener = (msg: ProcessEvent) => {
			msg.type === "event" && msg.id === event && callback({ ...msg.event, cancel });
		};

		process.addListener("message", listener);
		process.setMaxListeners(process.getMaxListeners() + 1);

		return cancel;
	} else {
		const listener = (opts: any) => callback({ ...opts, cancel });
		const cancel = () => {
			events.removeListener(event, listener);
			events.setMaxListeners(events.getMaxListeners() - 1);
		};
		events.setMaxListeners(events.getMaxListeners() + 1);
		events.addListener(event, listener);

		return cancel;
	}
}

async function rabbitListen(
	channel: Channel,
	id: string,
	callback: (event: EventOpts) => any,
	opts?: { acknowledge?: boolean }
) {
	await channel.assertExchange(id, "fanout", { durable: false });
	const q = await channel.assertQueue("", { exclusive: true, autoDelete: true });

	const cancel = () => {
		channel.cancel(q.queue);
		channel.unbindQueue(q.queue, id, "");
	};

	channel.bindQueue(q.queue, id, "");
	channel.consume(
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
		}
	);

	return cancel;
}
