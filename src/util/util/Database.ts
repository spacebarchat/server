import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { yellow, green, red } from "picocolors";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var dbConnection: DataSource | undefined;
let dbConnectionString =
	process.env.DATABASE || path.join(process.cwd(), "database.db");

// Gets the existing database connection
export function getDatabase(): DataSource | null {
	// if (!dbConnection) throw new Error("Tried to get database before it was initialised");
	if (!dbConnection) return null;
	return dbConnection;
}

// Called once on server start
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
		//@ts-ignore type 'string' is not 'mysql' | 'sqlite' | 'mariadb' | etc etc
		type,
		charset: "utf8mb4",
		url: isSqlite ? undefined : dbConnectionString,
		database: isSqlite ? dbConnectionString : undefined,
		entities: ["dist/util/entities/*.js"],
		synchronize: false,
		logging: false,
		bigNumberStrings: false,
		supportBigNumbers: true,
		name: "default",
		migrations: ["dist/util/migrations/*.js"],
	});

	dbConnection = await dataSource.initialize();

	await dbConnection.runMigrations();
	console.log(`[Database] ${green("connected")}`);

	return dbConnection;
}

export { dbConnection };

export function closeDatabase() {
	dbConnection?.destroy();
}
