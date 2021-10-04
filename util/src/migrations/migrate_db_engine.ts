import { config } from "dotenv";
config();
import * as Models from "../entities";
import { User } from "../entities/User";
import { createConnection, Connection } from "typeorm";
import { initDatabase } from "../util/Database";
import "missing-native-js-functions";

async function main() {
	if (!process.env.FROM) throw new Error("FROM database env connection string not set");

	// @ts-ignore
	const entities = Object.values(Models).filter((x) => x.constructor.name !== "Object" && x.name);

	const newDB = await initDatabase();

	// @ts-ignore
	const oldDB = await createConnection({
		type: process.env.FROM.split(":")[0]?.replace("+srv", ""),
		url: process.env.FROM,
		entities,
		name: "old",
	});

	await Promise.all(
		entities.map(async (x) => {
			const data = await oldDB.manager.find(User);

			await Promise.all(
				data.map(async (x) => {
					try {
						await newDB.manager.insert(User, x);
					} catch (error) {
						if (!x.id) throw new Error("object doesn't have a unique id: " + x);
						await newDB.manager.update(User, { id: x.id }, x);
					}
				})
			);
			// @ts-ignore
			console.log("migrated all " + x.name);
		})
	);

	console.log("SUCCESS migrated all data");
}

main().caught();
