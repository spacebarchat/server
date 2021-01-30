process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
setTimeout(() => {}, 100000000);

import { DiscordServer } from "./Server";

const server = new DiscordServer({ port: 3000 });
server.start().catch(console.error);
