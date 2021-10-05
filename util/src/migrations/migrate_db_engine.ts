import { config } from "dotenv";
config();
import { BaseEntity, createConnection, EntityTarget } from "typeorm";
import { initDatabase } from "../util/Database";
import "missing-native-js-functions";
import {
	Application,
	Attachment,
	Ban,
	Channel,
	ConnectedAccount,
	defaultSettings,
	Emoji,
	Guild,
	Invite,
	Member,
	Message,
	RateLimit,
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
} from "..";

async function main() {
	if (!process.env.FROM) throw new Error("FROM database env connection string not set");

	// manually arrange them because of foreign key
	const entities = [
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

	const newDB = await initDatabase();

	// @ts-ignore
	const oldDB = await createConnection({
		type: process.env.FROM.split(":")[0]?.replace("+srv", ""),
		url: process.env.FROM,
		entities,
		name: "old",
	});
	let i = 0;

	try {
		for (const e of entities) {
			const entity = e as EntityTarget<any>;
			const entries = await oldDB.manager.find(entity);
			//@ts-ignore
			console.log("migrated " + entries.length + " " + entity.name);

			for (const entry of entries) {
				console.log(i++);

				if (entry instanceof User) {
					console.log("instance of User");
					if (entry.bio == null) entry.bio = "";
					if (entry.rights == null) entry.rights = "0";
					if (entry.disabled == null) entry.disabled = false;
					if (entry.fingerprints == null) entry.fingerprints = [];
					if (entry.deleted == null) entry.deleted = false;
					if (entry.data == null) {
						entry.data = {
							valid_tokens_since: new Date(0),
							hash: undefined,
						};
						// @ts-ignore
						if (entry.user_data) {
							// TODO: relationships
							entry.data = {
								// @ts-ignore
								valid_tokens_since: entry.user_data.valid_tokens_since, // @ts-ignore
								hash: entry.user_data.hash,
							};
						}
					}
					// @ts-ignore
					if (entry.settings == null) {
						entry.settings = defaultSettings;
						// @ts-ignore
						if (entry.user_data) entry.settings = entry.user_settings;
					}
				}

				// try {
				await newDB.manager.insert(entity, entry);
				// } catch (error) {
				// 	if (!entry.id) throw new Error("object doesn't have a unique id: " + entry);
				// 	await newDB.manager.update(entity, { id: entry.id }, entry);
				// }
			}
			// @ts-ignore
			console.log("migrated all " + entity.name);
		}
	} catch (error) {
		console.error((error as any).message);
	}

	console.log("SUCCESS migrated all data");
	await newDB.close();
}

main().caught();
