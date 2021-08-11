import amqp, { Connection, Channel } from "amqplib";
import Config from "./Config";

var rabbitCon: Connection;
var rabbitCh: Channel;

export async function init() {
	const host = Config.get().rabbitmq.host;
	if (!host) return;
	rabbitCon = await amqp.connect(host);
	rabbitCh = await rabbitCon.createChannel();
}

export { rabbitCon, rabbitCh };
