import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { green, red, yellow } from "picocolors";
import { exit } from "process";
import "reflect-metadata";
import { DataSource, DataSourceOptions, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import * as Models from "../entities";
import { BaseClass, BaseClassWithoutId } from "../entities";
import { namingStrategy } from "./NamingStrategy";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

let promise: Promise<any>;
let dataSource: DataSource;

export async function getOrInitialiseDatabase(): Promise<DataSource> {
	//if (dataSource) return dataSource; // prevent initalizing multiple times

	if (dataSource.isInitialized) return dataSource;

	await dataSource.initialize();
	console.log(`[Database] ${green("Connected!")}`);
	await dataSource.runMigrations();
	console.log(`[Database] ${green("Up to date!")}`);

	if ("DB_MIGRATE" in process.env) {
		console.log("DB_MIGRATE specified, exiting!");
		exit(0);
	}
	return dataSource;
}

export function closeDatabase() {
	dataSource?.destroy();
}

function getDataSourceOptions(): DataSourceOptions {
	config();
	//get connection string and check for migrations
	const dbConnectionString = process.env.DATABASE || path.join(process.cwd(), "database.db");
	const type = dbConnectionString.includes("://") ? dbConnectionString.split(":")[0]?.replace("+srv", "") : ("sqlite" as any);
	const isSqlite = type.includes("sqlite");
	const migrationsExist = fs.existsSync(path.join(__dirname, "..", "migrations", type));
	//read env vars
	const synchronizeInsteadOfMigrations = "DB_UNSAFE" in process.env;
	const verboseDb = "DB_VERBOSE" in process.env;

	if (isSqlite)
		console.log(`[Database] ${red(`You are running sqlite! Please keep in mind that we recommend setting up a dedicated database!`)}`);
	if (verboseDb)
		console.log(
			`[Database] ${red(`Verbose database logging is enabled, this might impact performance! Unset DB_VERBOSE to disable.`)}`
		);

	if (synchronizeInsteadOfMigrations) {
		console.log(
			`[Database] ${red(
				`Unsafe database upgrades are enabled! We are not responsible for broken databases! Unset DB_UNSAFE to disable.`
			)}`
		);
	} else if (!migrationsExist) {
		console.log(`[Database] ${red(`Database engine not supported! Set UNSAFE_DB to bypass.`)}`);
		console.log(`[Database] ${red(`Please mention this to Fosscord developers, and provide this info:`)}`);
		console.log(
			`[Database]\n${red(
				JSON.stringify(
					{
						db_type: type,
						migrations_exist: migrationsExist
					},
					null,
					4
				)
			)}`
		);

		if (!("DB_MIGRATE" in process.env)) exit(1);
	}
	console.log(`[Database] ${yellow(`Configuring data source to use ${type} database...`)}`);
	return {
		type,
		charset: "utf8mb4",
		url: isSqlite ? undefined : dbConnectionString,
		database: isSqlite ? dbConnectionString : undefined,
		// @ts-ignore
		//entities: Object.values(Models).filter((x) => x.constructor.name !== "Object" && x.constructor.name !== "Array" && x.constructor.name !== "BigInt" && x).map(x=>x.name),
		entities: Object.values(Models).filter((x) => x.constructor.name == "Function" && shouldIncludeEntity(x.name)),
		synchronize: synchronizeInsteadOfMigrations,
		logging: verboseDb,
		cache: {
			duration: 1000 * 3 // cache all find queries for 3 seconds
		},
		// relationLoadStrategy: "query",
		bigNumberStrings: false,
		supportBigNumbers: true,
		name: "default",
		migrations: synchronizeInsteadOfMigrations ? [] : [path.join(__dirname, "..", "migrations", type, "*.js")],
		migrationsRun: !synchronizeInsteadOfMigrations,
		//migrationsRun: false,
		cli: {
			migrationsDir: `src/migrations/${type}`
		},
		namingStrategy
	} as DataSourceOptions;
}

function shouldIncludeEntity(name: string): boolean {
	return ![BaseClassWithoutId, PrimaryColumn, BaseClass, PrimaryGeneratedColumn].map((x) => x.name).includes(name);
}

export default dataSource = new DataSource(getDataSourceOptions());
