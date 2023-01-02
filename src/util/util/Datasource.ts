import { BaseClass, BaseClassWithoutId } from "../entities/BaseClass";
import { config } from "dotenv";
import path from "path";
import { DataSource, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
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

if (!process.env.DB_SYNC) {
	const supported = ["mysql", "mariadb", "postgres", "sqlite"];
	if (!supported.includes(type)) {
		console.log("[Database]" + red(` We don't have migrations for DB type '${type}'` +
			` To ignore, set DB_SYNC=true in your env. https://docs.fosscord.com/setup/server/configuration/env/`));
		process.exit();
	}
}

function shouldIncludeEntity(name: string): boolean {
	return ![BaseClassWithoutId, PrimaryColumn, BaseClass, PrimaryGeneratedColumn].map((x) => x.name).includes(name);
}

const dataSource = new DataSource({
	//@ts-ignore type 'string' is not 'mysql' | 'sqlite' | 'mariadb' | etc etc
	type,
	charset: "utf8mb4",
	url: isSqlite ? undefined : dbConnectionString,
	database: isSqlite ? dbConnectionString : undefined,
	entities: ["dist/util/entities/*.js"],
	//@ts-ignore
	// entities: Object.values(Models).filter((x) => x.constructor.name == "Function" && shouldIncludeEntity(x.name)),
	synchronize: !!process.env.DB_SYNC,
	logging: false,
	bigNumberStrings: false,
	supportBigNumbers: true,
	name: "default",
	migrations: [path.join(__dirname, "..", "migrations", type, "*.js")],
});

export { dataSource as DataSourceOptions, type as DatabaseType };