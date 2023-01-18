/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { DataSource } from "typeorm";
import { yellow, green, red } from "picocolors";
import { ConfigEntity } from "../entities/Config";
import { config } from "dotenv";
import path from "path";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var dbConnection: DataSource | undefined;

// For typeorm cli
if (!process.env) {
	config();
}

let dbConnectionString =
	process.env.DATABASE || path.join(process.cwd(), "database.db");

const DatabaseType = dbConnectionString.includes("://")
	? dbConnectionString.split(":")[0]?.replace("+srv", "")
	: "sqlite";
const isSqlite = DatabaseType.includes("sqlite");

const DataSourceOptions = new DataSource({
	//@ts-ignore type 'string' is not 'mysql' | 'sqlite' | 'mariadb' | etc etc
	type: DatabaseType,
	charset: "utf8mb4",
	url: isSqlite ? undefined : dbConnectionString,
	database: isSqlite ? dbConnectionString : undefined,
	entities: ["dist/util/entities/*.js"],
	synchronize: !!process.env.DB_SYNC,
	logging: false,
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

	if (!process.env.DB_SYNC) {
		const supported = ["mysql", "mariadb", "postgres", "sqlite"];
		if (!supported.includes(DatabaseType)) {
			console.log(
				"[Database]" +
					red(
						` We don't have migrations for DB type '${DatabaseType}'` +
							` To ignore, set DB_SYNC=true in your env. https://docs.fosscord.com/setup/server/configuration/env/`,
					),
			);
			process.exit();
		}
	}

	console.log(`[Database] ${yellow(`connecting to ${DatabaseType} db`)}`);

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
	} else {
		await dbConnection.runMigrations();
	}

	console.log(`[Database] ${green("connected")}`);

	return dbConnection;
}

export { dbConnection, DataSourceOptions, DatabaseType };

export async function closeDatabase() {
	await dbConnection?.destroy();
}
