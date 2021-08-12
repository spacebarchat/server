import { Intents, Permissions } from "@fosscord/server-util";
import WS, { Server, Data } from "ws";
import { Deflate } from "zlib";
import { Channel } from "amqplib";

interface WebSocket extends WS {
	version: number;
	user_id: string;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	shard_count?: bigint;
	shard_id?: bigint;
	deflate?: Deflate;
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
	intents: Intents;
	sequence: number;
	rabbitCh?: Channel & { queues: Record<string, string> };
	permissions: Record<string, Permissions>;
}

export default WebSocket;
export { Server, Data };
