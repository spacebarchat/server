import { Intents, Permissions } from "@fosscord/util";
import WS from "ws";
import { Deflate, Inflate } from "fast-zlib";
import { Client } from "@fosscord/webrtc";

export interface WebSocket extends WS {
	version: number;
	user_id: string;
	session_id: string;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	ipAddress?: string;
	shard_count?: bigint;
	shard_id?: bigint;
	deflate?: Deflate;
	inflate?: Inflate;
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
	intents: Intents;
	sequence: number;
	permissions: Record<string, Permissions>;
	events: Record<string, Function>;
	member_events: Record<string, Function>;
	listen_options: any;
	client?: Client;
}
