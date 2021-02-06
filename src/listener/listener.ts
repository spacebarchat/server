import { db, User } from "discord-server-util";
import { ProviderCache } from "lambert-db";
import { MongodbProviderCache } from "lambert-db/dist/Mongodb";
import WebSocket from "../util/WebSocket";

export async function setupListener(this: WebSocket) {
	// TODO: shard guilds (only for bots)

	const user: User = await db.data.users({ id: this.userid }).get();

	// * MongoDB specific $in query to get all guilds of the user
	const guildCache: MongodbProviderCache = await db.data
		.guilds({ id: { $id: user.guilds } })
		.cache({ onlyEvents: true })
		.init();

	guildCache.on("change", (data) => {
		console.log(data);
	});

	this.once("close", async () => {
		await guildCache.destroy();
	});
}
