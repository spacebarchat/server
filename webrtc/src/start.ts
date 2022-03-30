import { config } from "dotenv";
config();

//testing
process.env.DATABASE = "../bundle/database.db";
process.env.DEBUG = "mediasoup*"

import { Server } from "./Server";

const server = new Server();
server.listen();