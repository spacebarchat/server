import path from "path";
import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import * as Models from "../entities";
import { Migration } from "../entities/Migration";
import { yellow, green } from "nanocolors";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var promise: Promise<any>;
var dbConnection: Connection | undefined;
let dbConnectionString = process.env.DATABASE || path.join(process.cwd(), "database.db");

export function initDatabase(): Promise<Connection> {
	if (promise) return promise; // prevent initalizing multiple times

	const type = dbConnectionString.includes("://") ? dbConnectionString.split(":")[0]?.replace("+srv", "") : "sqlite";
	const isSqlite = type.includes("sqlite");

	console.log(`[Database] ${yellow(`connecting to ${type} db`)}`);
	// @ts-ignore
	promise = createConnection({
		type,
		url: isSqlite ? undefined : dbConnectionString,
		database: isSqlite ? dbConnectionString : undefined,
		// @ts-ignore
		entities: Object.values(Models).filter((x) => x.constructor.name !== "Object" && x.name),
		synchronize: type !== "mongodb",
		logging: false,
		cache: {
			duration: 1000 * 3, // cache all find queries for 3 seconds
		},
		bigNumberStrings: false,
		supportBigNumbers: true,
		name: "default",
		migrations: [path.join(__dirname, "..", "migrations", "*.js")],
	});

	promise.then(async (connection: Connection) => {
		dbConnection = connection;

		// run migrations, and if it is a new fresh database, set it to the last migration
		if (connection.migrations.length) {
			if (!(await Migration.findOne({}))) {
				let i = 0;

				await Migration.insert(
					connection.migrations.map((x) => ({
						id: i++,
						name: x.name,
						timestamp: Date.now(),
					}))
				);
			}
		}
		await connection.runMigrations();
		console.log(`[Database] ${green("connected")}`);
	});

	return promise;
}

export { dbConnection };

export function closeDatabase() {
	dbConnection?.close();
}
