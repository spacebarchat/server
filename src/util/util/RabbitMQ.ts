import amqp, { Connection, Channel } from "amqplib";
// import Config from "./Config";

export const RabbitMQ: { connection: Connection | null; channel: Channel | null; init: () => Promise<void> } = {
	connection: null,
	channel: null,
	init: async function () {
		return;
		// const host = Config.get().rabbitmq.host;
		// if (!host) return;
		// console.log(`[RabbitMQ] connect: ${host}`);
		// this.connection = await amqp.connect(host, {
		// 	timeout: 1000 * 60,
		// });
		// console.log(`[RabbitMQ] connected`);
		// this.channel = await this.connection.createChannel();
		// console.log(`[RabbitMQ] channel created`);
	},
};
