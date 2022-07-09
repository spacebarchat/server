import { Command } from "./index.js";

export default {
	name: "instance",
	exec: ({ message }) => {
		message.reply("Test");
	}
} as Command;