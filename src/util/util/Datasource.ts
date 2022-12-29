import { config } from "dotenv"
import path from "path";
import { DataSource } from "typeorm";
import { red } from "picocolors";

// For typeorm cli
if (!process.env) {
	config();
}

let dbConnectionString =
	process.env.DATABASE || path.join(process.cwd(), "database.db");

const type = dbConnectionString.includes("://")
	? dbConnectionString.split(":")[0]?.replace("+srv", "")
	: "sqlite";
const isSqlite = type.includes("sqlite");

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

export { dataSource as DataSourceOptions, type as DatabaseType };