import dotenv from "dotenv";
dotenv.config();

import { CDNServer } from "./Server";
const server = new CDNServer({ port: Number(process.env.PORT) || 3003 });
server
	.start()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));

module.exports = server;
