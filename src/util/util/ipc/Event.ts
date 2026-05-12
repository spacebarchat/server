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
import { randomUUID } from "node:crypto";
import EventEmitter from "node:events";
import path from "node:path";
import { RabbitMQ } from "../RabbitMQ";
import { EVENT, Event } from "../../interfaces";
import { Config } from "../Config";
import { BaseEventListener } from "./listener/BaseEventListener";
import { BaseEventWriter } from "./writer/BaseEventWriter";
import { UnixSocketWriter } from "./writer/UnixSocketWriter";
import { UnixSocketListener } from "./listener/UnixSocketListener";

export const events = new EventEmitter();
let listener: BaseEventListener | null = null;
let writer: BaseEventWriter | null = null;
let unixSocketListener: UnixSocketListener | null = null;
let unixSocketWriter: UnixSocketWriter | null = null;

export async function emitEvent(payload: Omit<Event, "created_at">) {
    const id = (payload.guild_id || payload.channel_id || payload.user_id || payload.session_id) as string;
    if (!id) return console.error("event doesn't contain any id", payload);

    if (RabbitMQ.connection) {
        const data = typeof payload.data === "object" ? JSON.stringify(payload.data) : payload.data; // use rabbitmq for event transmission

        const publishEvent = async (retryCount = 0): Promise<void> => {
            const channel = await RabbitMQ.getSafeChannel();
            try {
                await channel.assertExchange(id, "fanout", {
                    durable: false,
                });

                // assertQueue isn't needed, because a queue will automatically created if it doesn't exist
                const successful = channel.publish(id, "", Buffer.from(`${data}`), { type: payload.event });
                if (!successful) throw new Error("failed to send event");
            } catch (e) {
                // Check if this is a channel closed error and if we should retry
                const errorMessage = e instanceof Error ? e.message : String(e);
                const isChannelError = errorMessage.includes("Channel closed") || errorMessage.includes("IllegalOperationError") || errorMessage.includes("RESOURCE_ERROR");

                if (isChannelError && retryCount < 1) {
                    console.log("[RabbitMQ] Channel error detected, retrying with new channel...");
                    // Force the cached channel to be discarded by calling getSafeChannel which will create a new one
                    return publishEvent(retryCount + 1);
                }

                console.log("[RabbitMQ] ", e);
            }
        };

        await publishEvent();
    } else if (process.env.EVENT_TRANSMISSION === "unix" && process.env.EVENT_SOCKET_PATH) {
        if (!unixSocketWriter) {
            console.error("[Event] Unix socket writer not initialized, cannot emit event!");
            throw new Error("Unix socket writer not initialized");
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

    if (process.env.EVENT_TRANSMISSION === "unix" && process.env.EVENT_SOCKET_PATH) {
        if (!unixSocketWriter) {
            writer = unixSocketWriter = new UnixSocketWriter(process.env.EVENT_SOCKET_PATH);
            await unixSocketWriter.init();
        }
    }

    // Set up the spacebar event listener (used for config reload, etc.)
    const setupSpacebarListener = async () => {
        console.log("[Event] Setting up spacebar event listener");
        await listenEvent("spacebar", async (event) => {
            console.log("[Event] Received spacebar event:", event);
            if ((event.event as string) === "SB_RELOAD_CONFIG") {
                console.log("[Event] Reloading config due to RELOAD_CONFIG event");
                await Config.init(true);
            }
        });
    };

    // Initial setup
    await setupSpacebarListener();

    // Re-establish listener on reconnection
    RabbitMQ.on("reconnected", async () => {
        console.log("[Event] RabbitMQ reconnected, re-establishing spacebar listener");
        await setupSpacebarListener();
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
            listener = unixSocketListener = new UnixSocketListener(path.join(process.env.EVENT_SOCKET_PATH, `${process.pid}.sock`));
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
        messageTtl: 5000,
    });

    const consumerTag = randomUUID();

    const cancel = async () => {
        try {
            await channel.unbindQueue(q.queue, id, "");
            await channel.cancel(consumerTag);
        } catch (e) {
            console.log("[RabbitMQ] Error while cancelling channel (may be expected):", e instanceof Error ? e.message : e);
        }
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
