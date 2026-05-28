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

import { BaseEventWriter } from "./BaseEventWriter";
import amqp, { Channel, ChannelModel } from "amqplib";
import { Event, sleep } from "@spacebar/util";

export class RabbitMqSingleWriter extends BaseEventWriter {
    private readonly host: string;
    private connection?: ChannelModel;
    private channel?: Channel;

    constructor(host: string) {
        super();
        this.host = host;
    }

    async init(): Promise<void> {
        while (!this.connection) {
            try {
                console.log(`[RabbitMQSingleWriter] Connecting to: ${this.host}`);
                this.connection = await amqp.connect(this.host, {
                    timeout: 1000 * 60,
                    noDelay: true,
                });
                console.log(`[RabbitMQSingleWriter] Connected to: ${this.host}`);
            } catch (e) {
                console.log(`[RabbitMQSingleWriter] Failed to connect to to: ${this.host}: ${e}`);
                await sleep(1000);
            }
        }
        this.channel = await this.connection.createChannel();

        for (const sig of ["SIGINT", "SIGTERM", "SIGQUIT"] as const) {
            process.on(sig, () => this.close());
        }

        this.connection.on("error", (err) => {
            console.error("[RabbitMQSingleWriter] Connection error:", err);
        });

        this.connection.on("close", () => {
            console.error("[RabbitMQSingleWriter] Connection closed");
            sleep(1000).then(() => {
                this.init().catch((e) => console.error("[RabbitMQSingleWriter] Failed to schedule reconnection:", e));
            });
        });
    }

    async close(): Promise<void> {
        await this.channel?.close();
        this.channel = undefined;
        await this.connection?.close();
        this.connection = undefined;
    }

    async emit(event: Event): Promise<void> {
        if (!this.connection) {
            throw new Error("RabbitMqSingleWriter#emit called without connection being initialised!");
        }
        if (!this.channel) {
            throw new Error("RabbitMqSingleWriter#emit called without channel being initialised!");
        }

        // todo check if channel is closed
        if ((this.channel as unknown as { closed?: boolean }).closed) this.channel = await this.connection.createChannel();
        await this.channel.assertExchange("-", "fanout", {
            durable: false, // ensure that messages arent written to disk
        });

        let success = false;
        try {
            success = this.channel.publish(
                "-",
                "",
                Buffer.from(JSON.stringify({ id: (event.guild_id || event.channel_id || event.user_id || event.session_id) as string, event })),
                {},
            );
        } catch (e) {
            console.error("[RabbitMqSingleWriter] Got error while publishing event:", e);
        }

        if (!success) {
            console.log("[RabbitMqSingleWriter] Publishing message was not successful, retrying...");
            await this.emit(event);
        }
    }
}
