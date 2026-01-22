import moduleAlias from "module-alias";
moduleAlias(__dirname + "../../package.json");
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

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
            await new Promise((res) => setTimeout(res, 2000));
            await main();
        }
    }
}

main().then((r) => console.log("meow"));
