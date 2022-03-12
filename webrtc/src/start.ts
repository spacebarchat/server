//testing
process.env.DATABASE = "../bundle/database.db";

import { config } from "dotenv";
config();

import { Server } from "./Server";

const server = new Server();
server.listen();