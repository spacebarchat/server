process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { Server } from "./Server";
import { config } from "dotenv";
config();

const port = Number(process.env.PORT) || 3004;

const server = new Server({
	port,
});
server.start();
