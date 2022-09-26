import { Message } from "discord.js";
import { Client } from "fosscord-gopnik/build/lib"; // huh? oh well. some bugs in my lib Ig

import { Command, getCommands } from "./commands/index.js";

export default class Bot {
	client: Client;
	commands: { [key: string]: Command } = {};

	constructor(client: Client) {
		this.client = client;
	}

	onReady = async () => {
		this.commands = await getCommands();

		console.log(`Logged in as ${this.client.user!.tag}`);

		this.client.user!.setPresence({
			activities: [
				{
					name: "EVERYTHING",
					type: "WATCHING",
				},
			],
		});
	};

	onMessageCreate = async (msg: Message) => {
		const prefix = process.env.PREFIX as string;
		if (msg.author.bot) return;
		if (!msg.content || msg.content.indexOf(prefix) === -1) return;

		const content = msg.content.slice(prefix.length).split(" ");
		const cmd = content.shift();
		if (!cmd) return;
		const args = content;

		const command = this.commands[cmd];
		if (!command) return;

		await command.exec({
			user: msg.author,
			member: msg.member,
			guild: msg.guild,
			message: msg,
			args: args,
		});
	};
}
