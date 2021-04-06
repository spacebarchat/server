import { Intents } from "fosscord-server-util";
import WS, { Server, Data } from "ws";
import { Deflate } from "zlib";

interface WebSocket extends WS {
	version: number;
	user_id: string;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	deflate?: Deflate;
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
	intents: Intents;
	sequence: number;
}

export default WebSocket;
export { Server, Data };
