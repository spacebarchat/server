require("module-alias/register");
import "dotenv/config";
import { APServer } from "./Server";

const port = Number(process.env.PORT) || 3005;
const server = new APServer({ port });
server.start().catch(console.error);
