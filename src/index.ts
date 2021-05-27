import { CDNServer } from "./Server";
import dotenv from "dotenv";
dotenv.config();

if (process.env.STORAGE_LOCATION) {
	if (!process.env.STORAGE_LOCATION.startsWith("/")) {
		process.env.STORAGE_LOCATION = __dirname + "/../" + process.env.STORAGE_LOCATION;
	}
} else process.env.STORAGE_LOCATION = __dirname + "/../files/";

const server = new CDNServer({ port: Number(process.env.PORT) || 3003 });
server
	.start()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));
