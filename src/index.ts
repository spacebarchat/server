import { DiscordServer } from "./Server";

const server = new DiscordServer({ port: 3000 });
server.start().catch(console.error);
