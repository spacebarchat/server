import WS, { Server, Data } from "ws";

interface WebSocket extends WS {
	version: number;
	userid: bigint;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
}

export default WebSocket;
export { Server, Data };
