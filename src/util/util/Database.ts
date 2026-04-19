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

import { config } from "dotenv";
import path from "node:path";
import { green, red, yellow } from "picocolors";
import { DataSource } from "typeorm";
// noinspection ES6PreferShortImport
import { ConfigEntity } from "../entities/Config";
import fs from "node:fs";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

export let dbConnection: DataSource | undefined;

let isHeadlessProcess = false;
// For typeorm cli
if (!process.env) {
    isHeadlessProcess = true;
    config({ quiet: true });
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

export const DataSourceOptions = isHeadlessProcess
    ? (undefined as unknown as DataSource)
    : new DataSource({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore type 'string' is not 'sqlite' | 'postgres' | etc etc
          type: DatabaseType,
          charset: "utf8mb4",
          url: process.env.DATABASE,
          entities: [path.join(__dirname, "..", "entities", "*.js")],
          synchronize: !!process.env.DB_SYNC,
          logging: !!process.env.DB_LOGGING,
          bigNumberStrings: false,
          supportBigNumbers: true,
          name: "default",
          migrations: applyMigrations ? [path.join(__dirname, "..", "migration", DatabaseType, "*.js")] : [],
      });

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

    dbConnection = await DataSourceOptions.initialize();

    // Crude way of detecting if the migrations table exists.
    const dbExists = async () => {
        try {
            await ConfigEntity.count();
            return true;
        } catch (e) {
            return false;
        }
    };
    if (applyMigrations) {
        if (!(await dbExists())) {
            console.log("[Database] This appears to be a fresh database. Running initial DDL.");
            const qr = dbConnection.createQueryRunner();
            const initialPath = path.join(__dirname, "..", "migration", DatabaseType + "-initial.js");
            if (fs.existsSync(initialPath)) {
                console.log("[Database] Found initial migration file, running it.");
                await new (require(`../migration/${DatabaseType}-initial`).initial0)().up(qr);
            } else console.log("[Database] No initial migration file found at '", initialPath, "', skipping.");
            await qr.release();
        }

        console.log("[Database] Applying missing migrations, if any.", process.env.APPLY_DB_MIGRATIONS);
        await dbConnection.runMigrations();
    } else {
        console.log("[Database] Skipping migrations as per config.");
        while (!(await dbExists())) {
            console.log("[Database] Database does not exist, and we are not running migrations... Waiting 1 seconds...");
            await new Promise((r) => setTimeout(r, 5000));
        }
    }

    console.log(`[Database] ${green("Connected")}`);

    return dbConnection;
}

export async function closeDatabase() {
    await dbConnection?.destroy();
}
