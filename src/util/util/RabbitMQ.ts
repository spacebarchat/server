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

import amqp, { Channel, ChannelModel } from "amqplib";
import { Config } from "./Config";

export const RabbitMQ: {
	connection: ChannelModel | null;
	channel: Channel | null;
	init: () => Promise<void>;
} = {
	connection: null,
	channel: null,
	init: async function () {
		const host = Config.get().rabbitmq.host;
		if (!host) return;
		console.log(`[RabbitMQ] connect: ${host}`);
		this.connection = await amqp.connect(host, {
			timeout: 1000 * 60,
		});
		console.log(`[RabbitMQ] connected`);

		// log connection errors
		this.connection.on("error", (err) => {
			console.error("[RabbitMQ] Connection Error:", err);
		});

		this.connection.on("close", () => {
			console.error("[RabbitMQ] connection closed");
			// TODO: Add reconnection logic here if the connection crashes??
			// will be a pain since we will have to reconstruct entire state
		});

		this.channel = await this.connection.createChannel();
		console.log(`[RabbitMQ] channel created`);

		// log channel errors
		this.channel.on("error", (err) => {
			console.error("[RabbitMQ] Channel Error:", err);
		});
	},
};
