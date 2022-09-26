import { Command } from "./index.js";
import { User, Guild, Message } from "@fosscord/util";

const cache: { [key: string]: number } = {
	users: 0,
	guilds: 0,
	messages: 0,
	lastChecked: 0,
};

export default {
	name: "instance",
	exec: async ({ message }) => {
		if (
			Date.now() >
			cache.lastChecked + parseInt(process.env.CACHE_TTL as string)
		) {
			cache.users = await User.count();
			cache.guilds = await Guild.count();
			cache.messages = await Message.count();
			cache.lastChecked = Date.now();
		}

		return message.reply({
			embeds: [
				{
					title: "Instance Stats",
					description:
						"For more indepth information, check out https://grafana.understars.dev",
					footer: {
						text: `Last checked: ${Math.floor(
							(Date.now() - cache.lastChecked) / (1000 * 60),
						)} minutes ago`,
					},
					fields: [
						{
							inline: true,
							name: "Total Users",
							value: cache.users.toString(),
						},
						{
							inline: true,
							name: "Total Guilds",
							value: cache.guilds.toString(),
						},
						{
							inline: true,
							name: "Total Messages",
							value: cache.messages.toString(),
						},
					],
				},
			],
		});
	},
} as Command;
