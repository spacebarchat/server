process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
setTimeout(() => {}, 100000000);

import { Server } from "./Server";
import { config } from "dotenv";
config();

const server = new Server();
server.listen();
