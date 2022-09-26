process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { config } from "dotenv";
import { Server } from "./Server";
config();

const port = Number(process.env.PORT) || 3004;

const server = new Server({
	port,
});
server.start();
