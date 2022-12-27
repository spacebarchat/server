import "reflect-metadata";
import { DataSource } from "typeorm";
import { yellow, green, red } from "picocolors";
import { DataSourceOptions, DatabaseType } from "./Datasource";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

var dbConnection: DataSource | undefined;


// Gets the existing database connection
export function getDatabase(): DataSource | null {
	// if (!dbConnection) throw new Error("Tried to get database before it was initialised");
	if (!dbConnection) return null;
	return dbConnection;
}

// Called once on server start
export async function initDatabase(): Promise<DataSource> {
	if (dbConnection) return dbConnection;

	console.log(`[Database] ${yellow(`connecting to ${DatabaseType} db`)}`);

	dbConnection = await DataSourceOptions.initialize();

	await dbConnection.runMigrations();
	console.log(`[Database] ${green("connected")}`);

	return dbConnection;
}

export { dbConnection };

export function closeDatabase() {
	dbConnection?.destroy();
}
