import { Channel, ConsumeMessage } from "amqplib";
import { EVENT, Event, EventModel } from "../models";
import { RabbitMQ } from "./RabbitMQ";
import EventEmitter from "events";
const events = new EventEmitter();

export async function emitEvent(payload: Omit<Event, "created_at">) {
	const id = (payload.channel_id || payload.user_id || payload.guild_id) as string;
	if (!id) console.error("event doesn't contain any id", payload);

	if (RabbitMQ.connection) {
		const data = typeof payload.data === "object" ? JSON.stringify(payload.data) : payload.data; // use rabbitmq for event transmission
		await RabbitMQ.channel?.assertExchange(id, "fanout", { durable: false });

		// assertQueue isn't needed, because a queue will automatically created if it doesn't exist
		const successful = RabbitMQ.channel?.publish(id, "", Buffer.from(`${data}`), { type: payload.event });
		if (!successful) throw new Error("failed to send event");
	} else {
		console.log("emit event", id);
		events.emit(id, payload);
	}
}

export async function initEvent() {
	await RabbitMQ.init(); // does nothing if rabbitmq is not setup
	if (RabbitMQ.connection) {
	} else {
		// use event emitter
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

export async function listenEvent(event: string, callback: (event: EventOpts) => any, opts?: ListenEventOpts) {
	if (RabbitMQ.connection) {
		// @ts-ignore
		return rabbitListen(opts?.channel || RabbitMQ.channel, event, callback, { acknowledge: opts?.acknowledge });
	} else {
		const cancel = () => {
			console.log("cancel event", event);
			events.removeListener(event, callback);
		};
		console.log("listen event", event);
		events.addListener(event, (opts) => callback({ ...opts, cancel }));

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
