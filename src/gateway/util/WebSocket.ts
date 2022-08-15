import { Intents, Permissions } from "@fosscord/util";
import WS from "ws";
import { Deflate } from "zlib";
import SemanticSDP from "semantic-sdp";
import { Transport } from "medooze-media-server";
import { Server } from "@fosscord/webrtc";

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
	sdp?: SemanticSDP.SDPInfo;
	transport?: Transport;
	ssrc?: number;
	server?: Server;
}
