import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import * as Models from "../entities";
import { Migration } from "../entities/Migration";
import { yellow, green, red } from "picocolors";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var dbConnection: DataSource | undefined;
let dbConnectionString =
	process.env.DATABASE || path.join(process.cwd(), "database.db");

export function getDatabase(): DataSource | null {
	// if (!dbConnection) throw new Error("Tried to get database before it was initialised");
	if (!dbConnection) return null;
	return dbConnection;
}

export async function initDatabase(): Promise<DataSource> {
	if (dbConnection) return dbConnection;

	const type = dbConnectionString.includes("://")
		? dbConnectionString.split(":")[0]?.replace("+srv", "")
		: "sqlite";
	const isSqlite = type.includes("sqlite");

	console.log(`[Database] ${yellow(`connecting to ${type} db`)}`);
	if (isSqlite) {
		console.log(
			`[Database] ${red(
				`You are running sqlite! Please keep in mind that we recommend setting up a dedicated database!`,
			)}`,
		);
	}

	const dataSource = new DataSource({
		//@ts-ignore
		type,
		charset: "utf8mb4",
		url: isSqlite ? undefined : dbConnectionString,
		database: isSqlite ? dbConnectionString : undefined,
		entities: ["dist/util/entities/*.js"],
		synchronize: type !== "mongodb",
		logging: false,
		bigNumberStrings: false,
		supportBigNumbers: true,
		name: "default",
		// migrations: [path.join(__dirname, "..", "migrations", "*.js")],
	});

	dbConnection = await dataSource.initialize();

	// // @ts-ignore
	// promise = createConnection({
	// 	type,
	// 	charset: 'utf8mb4',
	// 	url: isSqlite ? undefined : dbConnectionString,
	// 	database: isSqlite ? dbConnectionString : undefined,
	// 	// @ts-ignore
	// 	entities: Object.values(Models).filter((x) => x?.constructor?.name !== "Object" && x?.name),
	// 	synchronize: type !== "mongodb",
	// 	logging: false,
	// 	// cache: { // cache is used only by query builder and entity manager
	// 	// duration: 1000 * 30,
	// 	// type: "redis",
	// 	// options: {
	// 	// host: "localhost",
	// 	// port: 6379,
	// 	// },
	// 	// },
	// 	bigNumberStrings: false,
	// 	supportBigNumbers: true,
	// 	name: "default",
	// 	migrations: [path.join(__dirname, "..", "migrations", "*.js")],
	// });

	// // run migrations, and if it is a new fresh database, set it to the last migration
	// if (dbConnection.migrations.length) {
	// 	if (!(await Migration.findOne({ }))) {
	// 		let i = 0;

	// 		await Migration.insert(
	// 			dbConnection.migrations.map((x) => ({
	// 				id: i++,
	// 				name: x.name,
	// 				timestamp: Date.now(),
	// 			}))
	// 		);
	// 	}
	// }
	await dbConnection.runMigrations();
	console.log(`[Database] ${green("connected")}`);

	return dbConnection;
}

export { dbConnection };

export function closeDatabase() {
	dbConnection?.destroy();
}
