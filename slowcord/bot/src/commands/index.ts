import { Message, GuildMember, Guild, User } from "discord.js";
import fs from "fs";

export type CommandContext = {
	user: User,
	guild: Guild | null,
	member: GuildMember | null,
	message: Message,
	args: string[],
};

export type Command = {
	name: string;
	exec: (ctx: CommandContext) => any;
};

const walk = async (path: string): Promise<Command[]> => {
	const files = fs.readdirSync(path);
	const out: Command[] = [];
	for (var file of files) {
		if (file.indexOf("index") !== -1) continue;

		var imported = await import(`${path}/${file}`);
	}

	return out;
};

export const getCommands = async () => {
	const map: { [key: string]: Command; } = {};
	(await walk("./build/commands")).forEach((val) => map[val.name] = val);
	return map;
};