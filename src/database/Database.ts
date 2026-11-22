/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import path from "node:path";
import fs from "node:fs";
import { green, red, yellow } from "picocolors";
import { DataSource } from "typeorm";
import type Pool from "pg-pool";
import type { Client } from "pg";
import { Gauge } from "@prometheus-io/client";
import { PostgresDataSourceOptions } from "typeorm/driver/postgres/PostgresDataSourceOptions";
import { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";
import { ProcessLifecycle } from "../util/util/ProcessLifecycle";
import { Monitoring } from "@spacebar/util/monitoring/Monitoring";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

export let dbConnection: DataSource | undefined;

let isHeadlessProcess = false;
// For typeorm cli
if (!process.env) {
    isHeadlessProcess = true;
    require("dotenv").config({ quiet: true });
}
if (process.argv[1]?.endsWith("scripts/openapi.js")) isHeadlessProcess = true;

if (!process.env.DATABASE && !isHeadlessProcess) {
    console.log(
        red(
            "DATABASE environment variable not set! Please set it to your database connection string.\n" + "Example for postgres: postgres://user:password@localhost:5432/database",
        ),
    );
    process.exit(1);
}

const dbConnectionString = process.env.DATABASE!;
export const DatabaseType = isHeadlessProcess ? "postgres" : dbConnectionString.split(":")[0]?.replace("+srv", "");
const applyMigrations = process.env.APPLY_DB_MIGRATIONS !== "false";
const MIGRATIONLOCK = 1;
export const DataSourceOptions = isHeadlessProcess
    ? (undefined as unknown as DataSource)
    : new DataSource({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore type 'string' is not 'sqlite' | 'postgres' | etc etc
          type: DatabaseType,
          charset: "utf8mb4",
          url: process.env.DATABASE,
          entities: [path.join(__dirname, "entities", "*.js")],
          synchronize: !!process.env.DB_SYNC,
          logging: !!process.env.DB_LOGGING,
          bigNumberStrings: false,
          supportBigNumbers: true,
          name: "default",
          migrations: applyMigrations ? [path.join(__dirname, "migration", DatabaseType, "*.js")] : [],
          invalidWhereValuesBehavior: {
              null: "sql-null",
              undefined: "ignore",
          },
          connectTimeoutMS: 10000,
          poolSize: process.env.DB_POOL_SIZE ? Number(process.env.DB_POOL_SIZE) : 10,
          extra: {
              min: process.env.DB_POOL_SIZE_MIN ? Number(process.env.DB_POOL_SIZE_MIN) : 0,
              // redundant but for good measure:
              max: process.env.DB_POOL_SIZE ? Number(process.env.DB_POOL_SIZE) : 10,
              idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT_MS ? Number(process.env.DB_IDLE_TIMEOUT_MS) : 10000,
          },
      } satisfies PostgresDataSourceOptions);

// Gets the existing database connection
export function getDatabase(): DataSource | null {
    // if (!dbConnection) throw new Error("Tried to get database before it was initialised");
    if (!dbConnection) return null;
    return dbConnection;
}

// Called once on server start
export async function initDatabase(): Promise<DataSource> {
    if (dbConnection) return dbConnection;

    if (!process.env.DB_SYNC) {
        const supported = ["postgres"];
        if (!supported.includes(DatabaseType)) {
            console.log(
                "[Database]" +
                    red(
                        ` We don't have migrations for DB type '${DatabaseType}'` +
                            ` To ignore, set DB_SYNC=true in your env. https://docs.spacebar.chat/setup/server/configuration/env/`,
                    ),
            );
            process.exit(1);
        }
    }

    console.log(`[Database] ${yellow(`Connecting to ${DatabaseType} db`)}`);

    let retries = 0;
    do {
        try {
            dbConnection = await DataSourceOptions.initialize();
        } catch (e) {
            console.error("[Database] Could not connect to database after", retries, "retries:", e);
        }
    } while (!dbConnection && retries++ < 10);

    if (!dbConnection) throw new Error("[Database] FATAL: Could not connect to database!");

    const getPool = () => (dbConnection!.driver as PostgresDriver).master as Pool<Client>;

    Monitoring.attachMetric(
        "spacebar_db_connections_active",
        new Gauge({
            name: "spacebar_db_connections_active",
            help: "Number of active database connections",
            registers: [],
            collect() {
                if (!dbConnection?.isInitialized) return;
                const pool = getPool();
                this.set(pool.totalCount - pool.idleCount);
            },
        }),
    );

    Monitoring.attachMetric(
        "spacebar_db_connections_idle",
        new Gauge({
            name: "spacebar_db_connections_idle",
            help: "Number of idle database connections",
            registers: [],
            collect() {
                if (!dbConnection?.isInitialized) return;
                this.set(getPool().idleCount);
            },
        }),
    );

    Monitoring.attachMetric(
        "spacebar_db_query_queue_length",
        new Gauge({
            name: "spacebar_db_query_queue_length",
            help: "Number of queries waiting for database connections",
            registers: [],
            collect() {
                if (!dbConnection?.isInitialized) return;
                this.set(getPool().waitingCount);
            },
        }),
    );

    // Crude way of detecting if the migrations table exists.
    const dbExists = async () => {
        try {
            // do not globally import to avoid circular references
            await require("./entities/Config").ConfigEntity.count();
            return true;
        } catch (e) {
            return false;
        }
    };
    if (applyMigrations) {
        const qr = dbConnection.createQueryRunner();
        /*
        The advisory lock ensures that exactly one server is attempting to run migrations at a time.
        It is session-specific, so should be released if a crash occurs. It is also blocking, so all
        servers can run their logic.
         */
        await qr.query(`Select pg_advisory_lock(${MIGRATIONLOCK})`);
        if (!(await dbExists())) {
            console.log("[Database] This appears to be a fresh database. Running initial DDL.");
            const initialPath = path.join(__dirname, "migration", DatabaseType + "-initial.js");
            if (fs.existsSync(initialPath)) {
                console.log("[Database] Found initial migration file, running it.");
                await new (require(`./migration/${DatabaseType}-initial`).initial0)().up(qr);
            } else console.log("[Database] No initial migration file found at '", initialPath, "', skipping.");
        }
        console.log("[Database] Applying missing migrations, if any.", process.env.APPLY_DB_MIGRATIONS);
        await dbConnection.runMigrations();
        await qr.query(`Select pg_advisory_unlock(${MIGRATIONLOCK})`);
        await qr.release();
    } else {
        console.log("[Database] Skipping migrations as per config.");
        while (!(await dbExists())) {
            console.log("[Database] Database does not exist, and we are not running migrations... Waiting 1 seconds...");
            await new Promise((r) => void setTimeout(r, 5000));
        }
    }

    ProcessLifecycle.eventEmitter.on("stopped", async () => await closeDatabase());

    console.log(`[Database] ${green("Connected")}`);
    return dbConnection;
}

export async function closeDatabase() {
    if (DataSourceOptions.isInitialized) await DataSourceOptions.destroy();
    if (dbConnection?.isInitialized) await dbConnection?.destroy();
}
