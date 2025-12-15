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

class RabbitMQUtility {
	private _publishConnection: ChannelModel | null; // used for publishing events
	private _sharedPublishChannel: Channel | null;
	private _consumerConnection: ChannelModel | null; // used for consuming events
	private _sharedConsumerChannel: Channel | null;
	private _initialized: boolean = false;

	public async init(): Promise<void> {
		if (this._initialized) return;

		this._initialized = true;
		const host = Config.get().rabbitmq.host;
		if (!host) return;
		console.log(`[RabbitMQ] connect: ${host}`);

		await this.createPublishConnection();

		this._consumerConnection = await amqp.connect(host, {
			timeout: 1000 * 60,
		});

		this._consumerConnection.on("error", async (err) => {
			console.error("[RabbitMQ] Consumer Connection Error:", err);
			// this connection should be more stable
			// if it crashes, reconstructing it would be hard since we would have to recreate all
			// the user channels and restablish every consumer, so we don't and just hope it doesnt crash
		});

		this._consumerConnection.on("close", (e) => {
			console.log("[RabbitMQ] Consumer connection closed");
		});

		console.log(`[RabbitMQ] connected`);

		// initialize shared channels
		await this.getPublishChannel();
		await this.getConsumerChannel();
	}

	private async createPublishConnection(): Promise<void> {
		const host = Config.get().rabbitmq.host;
		if (!host) return;
		this._publishConnection = await amqp.connect(host, {
			timeout: 1000 * 60,
		});

		this._publishConnection.on("error", async (err) => {
			console.error("[RabbitMQ] Publish Connection Error:", err);

			// Add reconnection logic after connection crashes
			// we don't have to reconstruct any previous state since
			// this connection was used purely for publishing
			this._sharedPublishChannel = null;
			await this.createPublishConnection();
		});

		this._publishConnection.on("close", (e) => {
			console.log("[RabbitMQ] Publish connection closed");
		});
	}

	public async getPublishChannel(): Promise<Channel> {
		if (!this._publishConnection) return Promise.reject();

		if (this._sharedPublishChannel) return this._sharedPublishChannel;

		this._sharedPublishChannel = await this._publishConnection.createChannel();
		console.log(`[RabbitMQ] publish channel created`);

		// log channel errors
		this._sharedPublishChannel.on("error", (err) => {
			console.error("[RabbitMQ] Publish Channel Error:", err);
		});

		this._sharedPublishChannel.on("close", () => {
			console.log("[RabbitMQ] Publish channel closed");
			this._sharedPublishChannel = null;
		});

		return this._sharedPublishChannel;
	}

	public async getConsumerChannel(): Promise<Channel> {
		if (!this._consumerConnection) return Promise.reject();

		if (this._sharedConsumerChannel) return this._sharedConsumerChannel;

		this._sharedConsumerChannel = await this._consumerConnection.createChannel();
		console.log(`[RabbitMQ] consumer channel created`);

		this._sharedConsumerChannel.on("error", (err) => {
			console.error("[RabbitMQ] Consumer Channel Error:", err);
		});

		this._sharedConsumerChannel.on("close", () => {
			console.log("[RabbitMQ] Consumer channel closed");
			this._sharedConsumerChannel = null;
		});

		return this._sharedConsumerChannel;
	}

	public get publishConnection(): ChannelModel | null {
		return this._publishConnection;
	}

	public get consumerConnection(): ChannelModel | null {
		return this._consumerConnection;
	}
}

export const RabbitMQ = new RabbitMQUtility();
