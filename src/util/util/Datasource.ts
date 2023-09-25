import { config } from "dotenv";
import path from "path";
import { DataSource } from "typeorm";

// For typeorm cli
if (!process.env) {
	config();
}

const dbConnectionString =
	process.env.DATABASE || path.join(process.cwd(), "database.db");

const DatabaseType = dbConnectionString.includes("://")
	? dbConnectionString.split(":")[0]?.replace("+srv", "")
	: "sqlite";
const isSqlite = DatabaseType.includes("sqlite");

export const Datasource = new DataSource({
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore type 'string' is not 'mysql' | 'sqlite' | 'mariadb' | etc etc
	type: DatabaseType,
	charset: "utf8mb4",
	url: isSqlite ? undefined : dbConnectionString,
	database: isSqlite ? dbConnectionString : undefined,
	entities: [path.join(__dirname, "..", "entities", "*.js")],
	synchronize: !!process.env.DB_SYNC,
	logging: !!process.env.DB_LOGGING,
	bigNumberStrings: false,
	supportBigNumbers: true,
	name: "default",
	migrations: [path.join(__dirname, "..", "migration", DatabaseType, "*.js")],
});
