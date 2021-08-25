import "reflect-metadata";
import { createConnection } from "typeorm";
import * as Models from "../entities";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var promise: Promise<any>;

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

	promise.then(() => console.log("[Database] connected"));

	return promise;
}
