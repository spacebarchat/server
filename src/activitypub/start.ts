require("module-alias/register");
import "dotenv/config";

import { FederationServer } from "./Server";
const server = new FederationServer({ port: Number(process.env.PORT) || 3003 });
server
	.start()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));

module.exports = server;
