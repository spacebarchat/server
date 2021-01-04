import { DiscordServer } from "./Server";

const server = new DiscordServer();
server.start().catch(console.error);
