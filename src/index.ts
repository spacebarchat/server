process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import "missing-native-js-functions";
import { config } from "dotenv";
config();
import { DiscordServer } from "./Server";

const server = new DiscordServer({ port: 3000 || process.env.PORT });
server.start().catch(console.error);

// @ts-ignore
global.server = server;
export default server;
