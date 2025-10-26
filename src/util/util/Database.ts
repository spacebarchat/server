/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { config } from "dotenv";
import path from "path";
import { green, red, yellow } from "picocolors";
import { DataSource } from "typeorm";
import { ConfigEntity } from "../entities/Config";
import { Migration } from "../entities/Migration";
import { EnvConfig } from "../config";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

export let dbConnection: DataSource | undefined;

// For typeorm cli
if (!process.env) {
	config({ quiet: true });
}

const dbConnectionString = EnvConfig.get().database.url || path.join(process.cwd(), "database.db");

export const DatabaseType = dbConnectionString.includes("://")
	? dbConnectionString.split(":")[0]?.replace("+srv", "")
	: "sqlite";
const isSqlite = DatabaseType.includes("sqlite");

export const DataSourceOptions = new DataSource({
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore type 'string' is not 'sqlite' | 'postgres' | etc etc
	type: DatabaseType,
	charset: "utf8mb4",
	url: isSqlite ? undefined : dbConnectionString,
	database: isSqlite ? dbConnectionString : undefined,
	entities: [path.join(__dirname, "..", "entities", "*.js")],
	synchronize: EnvConfig.get().database.unsafeSchemaSync,
	logging: EnvConfig.get().logging.logDatabaseQueries,
	// Figure out why this doesn't work someday.
	// relationLoadStrategy: EnvConfig.get().database.disableJoins ? "query" : undefined, // mirrors DB_NO_JOINS
	bigNumberStrings: false,
	supportBigNumbers: true,
	name: "default",
	migrations: [path.join(__dirname, "..", "migration", DatabaseType, "*.js")],
});

// Gets the existing database connection
export function getDatabase(): DataSource | null {
	// if (!dbConnection) throw new Error("Tried to get database before it was initialised");
	if (!dbConnection) return null;
	return dbConnection;
}

// Called once on server start
export async function initDatabase(): Promise<DataSource> {
	if (dbConnection) return dbConnection;

	if (isSqlite) {
		console.log(
			`[Database] ${red(
				`You are running sqlite! Please keep in mind that we recommend setting up a dedicated database!`,
			)}`,
		);
	}

	if (!EnvConfig.get().database.unsafeSchemaSync) {
		const supported = ["postgres", "sqlite"];
		if (!supported.includes(DatabaseType)) {
			console.log(
				"[Database]" +
					red(
						` We don't have migrations for DB type '${DatabaseType}'` +
							` To ignore, set DB_UNSAFE_SCHEMA_SYNC=true in your env. https://docs.spacebar.chat/setup/server/configuration/env/`,
					),
			);
			process.exit();
		}
	}

	console.log(`[Database] ${yellow(`Connecting to ${DatabaseType} db`)}`);

	dbConnection = await DataSourceOptions.initialize();

	// Crude way of detecting if the migrations table exists.
	const dbExists = async () => {
		try {
			await ConfigEntity.count();
			return true;
		} catch (e) {
			return false;
		}
	};
	if (!(await dbExists())) {
		console.log(
			"[Database] This appears to be a fresh database. Synchronising.",
		);
		await dbConnection.synchronize();

		// On next start, typeorm will try to run all the migrations again from beginning.
		// Manually insert every current migration to prevent this:
		await Promise.all(
			dbConnection.migrations.map((migration) =>
				Migration.insert({
					name: migration.name,
					timestamp: Date.now(),
				}),
			),
		);
	} else {
		console.log("[Database] Applying missing migrations, if any.");
		await dbConnection.runMigrations();
	}

	console.log(`[Database] ${green("Connected")}`);

	return dbConnection;
}

export async function closeDatabase() {
	await dbConnection?.destroy();
}
