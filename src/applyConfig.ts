import { bgRedBright } from "picocolors";

require("dotenv").config({ quiet: true });
import moduleAlias from "module-alias";
moduleAlias();

process.env.CONFIG_PATH = process.argv[2] || "";
process.env.CONFIG_MODE = "overwrite";
process.env.CONFIG_WRITEBACK = "false";

import { initDatabase } from "@spacebar/util";
import { Config } from "@spacebar/util";
import { EnvConfig } from "@spacebar/util";

(async () => {
	console.log("Env config:", JSON.stringify(EnvConfig.get(), null, 2));
	await initDatabase();
	await Config.init();
})();
