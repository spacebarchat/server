import { Config, Guild, Session } from "@fosscord/util";

export async function initInstance() {
	// TODO: clean up database and delete tombstone data
	// TODO: set first user as instance administrator/or generate one if none exists and output it in the terminal

	// create default guild and add it to auto join
	// TODO: check if any current user is not part of autoJoinGuilds
	const { autoJoin } = Config.get().guild;

	if (autoJoin.enabled && !autoJoin.guilds?.length) {
		let guild = await Guild.findOne({});
		if (guild) {
			// @ts-ignore
			await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
		}
	}

	// TODO: do no clear sessions for instance cluster
	await Session.delete({});
}
