const { config } = require("dotenv");
config();
const { createConnection } = require("typeorm");
const { initDatabase } = require("../../dist/util/Database");
require("missing-native-js-functions");
const {
	Application,
	Attachment,
	Ban,
	Channel,
	ConfigEntity,
	ConnectedAccount,
	Emoji,
	Guild,
	Invite,
	Member,
	Message,
	ReadState,
	Recipient,
	Relationship,
	Role,
	Sticker,
	Team,
	TeamMember,
	Template,
	User,
	VoiceState,
	Webhook,
} = require("../../dist/entities/index");

async function main() {
	if (!process.env.TO) throw new Error("TO database env connection string not set");

	// manually arrange them because of foreign keys
	const entities = [
		ConfigEntity,
		User,
		Guild,
		Channel,
		Invite,
		Role,
		Ban,
		Application,
		Emoji,
		ConnectedAccount,
		Member,
		ReadState,
		Recipient,
		Relationship,
		Sticker,
		Team,
		TeamMember,
		Template,
		VoiceState,
		Webhook,
		Message,
		Attachment,
	];

	const oldDB = await initDatabase();

	const type = process.env.TO.includes("://") ? process.env.TO.split(":")[0]?.replace("+srv", "") : "sqlite";
	const isSqlite = type.includes("sqlite");

	// @ts-ignore
	const newDB = await createConnection({
		type,
		url: isSqlite ? undefined : process.env.TO,
		database: isSqlite ? process.env.TO : undefined,
		entities,
		name: "new",
		synchronize: true,
	});
	let i = 0;

	try {
		for (const entity of entities) {
			const entries = await oldDB.manager.find(entity);

			// @ts-ignore
			console.log("migrating " + entries.length + " " + entity.name + " ...");

			for (const entry of entries) {
				console.log(i++);

				try {
					await newDB.manager.insert(entity, entry);
				} catch (error) {
					try {
						if (!entry.id) throw new Error("object doesn't have a unique id: " + entry);
						await newDB.manager.update(entity, { id: entry.id }, entry);
					} catch (error) {
						console.error("couldn't migrate " + i + " " + entity.name, error);
					}
				}
			}

			// @ts-ignore
			console.log("migrated " + entries.length + " " + entity.name);
		}
	} catch (error) {
		console.error(error.message);
	}

	console.log("SUCCESS migrated all data");
	await newDB.close();
}

main().caught();
