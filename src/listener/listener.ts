import { db, User, Event } from "fosscord-server-util";
import { MongodbProviderCache } from "lambert-db/dist/Mongodb";
import WebSocket from "../util/WebSocket";

export async function setupListener(this: WebSocket) {
	// TODO: bot sharding
	// TODO: close connection on Invalidated Token

	const user: User = await db.data.users({ id: this.userid }).get();

	// * MongoDB specific $in query to get all guilds of the user
	const eventStream: MongodbProviderCache = await db.data
		.guilds({ $or: [{ guild_id: { $in: user.guilds } }, { user_id: this.userid }] })
		.cache({ onlyEvents: true })
		.init();

	eventStream.on("insert", (document: Event) => {
		console.log("event", document);
		this.emit(document.event, document.data);
	});

	this.once("close", () => eventStream.destroy());
}
