process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { Server } from "./Server";
import { config } from "dotenv";
config();

var port = Number(process.env.PORT);
if (isNaN(port)) port = 3002;

const server = new Server({
	port,
});
server.start();
