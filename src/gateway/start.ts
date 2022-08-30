process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { config } from "dotenv";
import { Server } from "./Server";
config();

let port = Number(process.env.PORT);
if (isNaN(port)) port = 3002;

const server = new Server({
	port
});
server.start();
