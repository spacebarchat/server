/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import moduleAlias from "module-alias";
moduleAlias(__dirname + "../../package.json");
import { config } from "dotenv";
config({ quiet: true });

process.env.DB_LOGGING = "true";

import { closeDatabase, initDatabase } from "@spacebar/database";
import { Config } from "@spacebar/util";
import { generateEmbedSingle, getOrUpdateEmbedCache } from "@spacebar/api";

async function main() {
    await initDatabase();
    await Config.init();
    for (const arg of process.argv.splice(2)) {
        console.log(arg + ":", (await generateEmbedSingle(arg))?.embeds);
    }
    await closeDatabase();
}

main().then(() => console.log("meow"));
