import moduleAlias from "module-alias";
moduleAlias(__dirname + "../../package.json");
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { config } from "dotenv";
config({ quiet: true });

process.env.DB_LOGGING = "true";

import { closeDatabase, initDatabase } from "@spacebar/util";

initDatabase().then(() => {
    closeDatabase().then((r) => {});
});
