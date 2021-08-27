import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import * as Models from "../entities";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var promise: Promise<any>;
var dbConnection: Connection | undefined;

export function initDatabase() {
	if (promise) return promise; // prevent initalizing multiple times

	console.log("[Database] connecting ...");
	// @ts-ignore
	promise = createConnection({
		type: "sqlite",
		database: "database.db",
		entities: Object.values(Models).filter((x) => x.constructor.name !== "Object"),
		synchronize: true,
		logging: false,
	});

	promise.then((connection) => {
		dbConnection = connection;
		console.log("[Database] connected");
	});

	return promise;
}

export { dbConnection };

export function closeDatabase() {
	dbConnection?.close();
}
