import path from "path";
import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import * as Models from "../entities";
import { yellow, green } from "nanocolors";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var promise: Promise<any>;
var dbConnection: Connection | undefined;
let dbConnectionString = process.env.DATABASE || path.join(process.cwd(), "database.db");

export function initDatabase() {
	if (promise) return promise; // prevent initalizing multiple times

	const type = dbConnectionString.includes(":") ? dbConnectionString.split(":")[0]?.replace("+srv", "") : "sqlite";
	const isSqlite = type.includes("sqlite");

	console.log(`[Database] ${yellow(`connecting to ${type} db`)}`);
	// @ts-ignore
	promise = createConnection({
		type,
		url: isSqlite ? undefined : dbConnectionString,
		database: isSqlite ? dbConnectionString : undefined,
		entities: Object.values(Models).filter((x) => x.constructor.name !== "Object"),
		synchronize: true,
		logging: false,
		cache: {
			duration: 1000 * 3, // cache all find queries for 3 seconds
		},
		bigNumberStrings: false,
		supportBigNumbers: true,
	});

	promise.then((connection) => {
		dbConnection = connection;
		console.log(`[Database] ${green("connected")}`);
	});

	return promise;
}

export { dbConnection };

export function closeDatabase() {
	dbConnection?.close();
}
