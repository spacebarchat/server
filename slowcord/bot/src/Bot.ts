import { Message } from "discord.js";
import { Client } from "fosscord-gopnik/build/lib";	// huh? oh well. some bugs in my lib Ig

export default class Bot {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	onReady = () => {
		console.log(`Logged in as ${this.client.user!.tag}`);

		this.client.user!.setPresence({
			activities: [{
				name: "EVERYTHING",
				type: "WATCHING",
			}]
		})
	};

	onMessageCreate = (msg: Message) => {
		
	};
}