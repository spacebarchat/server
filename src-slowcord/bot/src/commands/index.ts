import { Message, GuildMember, Guild, User } from "discord.js";
import fs from "fs";

export type CommandContext = {
	user: User;
	guild: Guild | null;
	member: GuildMember | null;
	message: Message;
	args: string[];
};

export type Command = {
	name: string;
	exec: (ctx: CommandContext) => any;
};

const walk = async (path: string) => {
	const files = fs.readdirSync(path);
	const out = [];
	for (var file of files) {
		if (fs.statSync(`${path}/${file}`).isDirectory()) continue;
		if (file.indexOf("index") !== -1) continue;
		if (file.indexOf(".js") !== file.length - 3) continue;
		var imported = (await import(`./${file}`)).default;
		out.push(imported);
	}
	return out;
};

export const getCommands = async () => {
	const map: { [key: string]: Command } = {};
	for (var cmd of await walk("./build/commands")) {
		map[cmd.name] = cmd;
	}
	return map;
};
