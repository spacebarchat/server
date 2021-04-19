process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import "missing-native-js-functions";
import { config } from "dotenv";
config();
import { DiscordServer } from "./Server";

var port = Number(process.env.PORT);
if (isNaN(port)) port = 1000;

const server = new DiscordServer({ port });
server.start().catch(console.error);

// @ts-ignore
global.server = server;
export default server;
