import { config } from "dotenv";
config();

import { Server } from "./Server";

//testing
process.env.DATABASE = "../bundle/database.db";

const server = new Server();
server.listen();