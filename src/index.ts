process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { Server } from "./Server";
import { config } from "dotenv";
config();

const server = new Server();
server.listen();
