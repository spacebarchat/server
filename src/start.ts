import dotenv from "dotenv";
dotenv.config();

import { CDNServer } from "./Server";

if (process.env.STORAGE_LOCATION) {
	if (!process.env.STORAGE_LOCATION.startsWith("/")) {
		process.env.STORAGE_LOCATION = __dirname + "/../" + process.env.STORAGE_LOCATION;
	}
} else {
	process.env.STORAGE_LOCATION = __dirname + "/../files/";
	process.env.STORAGE_PROVIDER = "file";
}

const server = new CDNServer({ port: Number(process.env.PORT) || 3003 });
server
	.start()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));
