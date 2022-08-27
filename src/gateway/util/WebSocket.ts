import { Intents, Permissions } from "@fosscord/util";
import { Client } from "@fosscord/webrtc";
import WS from "ws";
import { Deflate } from "zlib";

export interface WebSocket extends WS {
	version: number;
	user_id: string;
	session_id: string;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	shard_count?: number;
	shard_id?: number;
	deflate?: Deflate;
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
	intents: Intents;
	sequence: number;
	permissions: Record<string, Permissions>;
	events: Record<string, Function>;
	member_events: Record<string, Function>;
	listen_options: any;
	client: Client;
}
