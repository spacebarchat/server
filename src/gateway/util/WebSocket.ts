/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Intents, Permissions } from "@fosscord/util";
import WS from "ws";
import { Deflate, Inflate } from "fast-zlib";
// import { Client } from "@fosscord/webrtc";

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
	// client?: Client;
}
