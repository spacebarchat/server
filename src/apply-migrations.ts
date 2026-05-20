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
moduleAlias(__dirname + "../../../package.json");
import { config } from "dotenv";
config({ quiet: true });

process.env.DB_LOGGING = "true";

import { closeDatabase, initDatabase } from "@spacebar/util";

async function main() {
    let success = false;
    while (!success) {
        try {
            await initDatabase().then(async () => {
                await closeDatabase().then(async () => {
                    console.log("Successfully applied migrations!");
                    success = true;
                });
            });
        } catch (e) {
            console.error("Failed to apply migrations, retrying in 2s...", e);
            await new Promise((res) => void setTimeout(res, 2000));
            await main();
        }
    }
}

main().then(() => console.log("meow"));
