import path from "path";
import dotenv from "dotenv";
import fse from "fs-extra";
dotenv.config();
import { CDNServer } from "./Server";

if (!process.env.STORAGE_PROVIDER) process.env.STORAGE_PROVIDER = "file";
// TODO:nodejs path.join trailing slash windows compatible
if (process.env.STORAGE_PROVIDER === "file") {
	if (process.env.STORAGE_LOCATION) {
		if (!process.env.STORAGE_LOCATION.startsWith("/")) {
			process.env.STORAGE_LOCATION = path.join(__dirname, "..", process.env.STORAGE_LOCATION, "/");
		}
	} else {
		process.env.STORAGE_LOCATION = path.join(__dirname, "..", "files", "/");
	}
	fse.ensureDirSync(process.env.STORAGE_LOCATION);
}

const server = new CDNServer({ port: Number(process.env.PORT) || 3003 });
server
	.start()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));

module.exports = server;
