/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors
	
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

import EventEmitter from "node:events";
import { BaseEventListener } from "./BaseEventListener";
import { EVENT, Event, EventOpts, sleep } from "@spacebar/util";
import amqp, { Channel, ChannelModel } from "amqplib";
import { randomUUID } from "node:crypto";

export class RabbitMqSingleListener extends BaseEventListener {
    private readonly host: string;
    private connection?: ChannelModel;
    private channel?: Channel;
    eventEmitter: EventEmitter;

    constructor(host: string) {
        super();
        this.eventEmitter = new EventEmitter();
        this.host = host;
    }

    async init() {
        while (!this.connection) {
            try {
                console.log(`[RabbitMQSingleListener] Connecting to: ${this.host}`);
                this.connection = await amqp.connect(this.host, {
                    timeout: 1000 * 60,
                    noDelay: true,
                });
                console.log(`[RabbitMQSingleListener] Connected to: ${this.host}`);
            } catch (e) {
                console.log(`[RabbitMQSingleListener] Failed to connect to to: ${this.host}: ${e}`);
                await sleep(1000);
            }
        }
        this.channel = await this.connection.createChannel();

        for (const sig of ["SIGINT", "SIGTERM", "SIGQUIT"] as const) {
            process.on(sig, this.close);
        }

        this.connection.on("error", (err) => {
            console.error("[RabbitMQSingleListener] Connection error:", err);
        });

        this.connection.on("close", () => {
            console.error("[RabbitMQSingleListener] Connection closed");
            sleep(1000).then(() => {
                this.init().catch((e) => console.error("[RabbitMQSingleListener] Failed to schedule reconnection:", e));
            });
        });

        // actually set up event receiving?
        await this.channel.assertExchange("-", "fanout", { durable: false });
        const q = await this.channel.assertQueue("-", {
            exclusive: false,
            autoDelete: true,
            messageTtl: 5000,
        });

        const consumerTag = randomUUID();
        await this.channel.bindQueue(q.queue, "-", "");
        await this.channel.consume(
            q.queue,
            (opts) => {
                if (!opts) return;
                const data = JSON.parse(opts.content.toString()) as { id: EVENT; event: Event };

                this.eventEmitter.emit(data.id, data.event);
            },
            {
                consumerTag,
            },
        );
    }

    async close(): Promise<void> {
        await this.channel?.close();
        this.channel = undefined;
        await this.connection?.close();
        this.connection = undefined;
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
