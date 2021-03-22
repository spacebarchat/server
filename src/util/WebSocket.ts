import { Intents } from "fosscord-server-util";
import WS, { Server, Data } from "ws";

interface WebSocket extends WS {
	version: number;
	user_id: bigint;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
	intents: Intents;
}

export default WebSocket;
export { Server, Data };
