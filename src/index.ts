process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { DiscordServer } from "./Server";

const server = new DiscordServer({ port: 3000 });
server.start().catch(console.error);

// @ts-ignore
global.server = server;
