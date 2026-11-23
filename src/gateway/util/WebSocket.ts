/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

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

import WS from "ws";
import { Deflate, Inflate } from "fast-zlib";
import { Decoder, Encoder } from "@toondepauw/node-zstd";
import { Session } from "@spacebar/database";
import { TimeSpan } from "@spacebar/extensions";
import { Intents, ListenEventOpts, Permissions } from "@spacebar/util";
import { QoSPayload } from "../opcodes/Heartbeat";
import { Capabilities } from "./Capabilities";

export class WebSocket {
    rawSocket: WS;
    constructor(socket: WS) {
        this.rawSocket = socket;
        this.openedAt = new Date();
        this.discarded = false;
    }

    recentTransactions: string[] = [];
    openedAt: Date;
    closedAt?: Date;
    discarded: boolean;

    version: number;
    user_id: string;
    session_id: string;
    accessToken: string;
    encoding: "etf" | "json";
    compress?: "zlib-stream" | "zstd-stream";
    ipAddress?: string;
    userAgent?: string; // for cdn request signing
    fingerprint?: string;
    shard_count?: number;
    shard_id?: number;
    deflate?: Deflate;
    inflate?: Inflate;
    zstdEncoder?: Encoder;
    zstdDecoder?: Decoder;
    heartbeatTimeout: NodeJS.Timeout;
    readyTimeout: NodeJS.Timeout;
    intents: Intents;
    sequence: number = 0;
    permissions: Record<string, Permissions> = {};
    events: Record<string, () => Promise<unknown>> = {};
    member_events: Record<string, () => Promise<unknown>> = {};
    listen_options: ListenEventOpts;
    capabilities?: Capabilities;
    large_threshold: number;
    qos?: QoSPayload;
    session?: Session;

    internEvent(map: Record<string, () => Promise<unknown>>, key: string, handler: () => Promise<unknown>) {
        if (this.closedAt && TimeSpan.fromDates(+this.closedAt, +new Date()).totalSeconds > 300) {
            console.warn(`[Gateway/${this.user_id}/WebSocket] Tried to register event after socket state expiry, discarding...`);
            handler();
            return;
        }
        if (key in map) map[key](); // unbind old handler
        map[key] = handler;
    }

    removeEvent(map: Record<string, () => Promise<unknown>>, key: string) {
        if (key in map) {
            map[key]();
            delete map[key];
        }
    }

    discardAllState() {
        if (!this.closedAt) {
            console.warn(`[Gateway/${this.user_id}/WebSocket] WARN: Tried to discard state before close!`);
            return;
        }
        this.discarded = true;
        this.recentTransactions = [];
        this.permissions = {};
        this.session = undefined;

        this.deflate?.close();
        this.deflate = undefined;
        this.inflate?.close();
        this.inflate = undefined;
        this.zstdEncoder = undefined;
        this.zstdDecoder = undefined;

        for (const key in this.events) {
            this.events[key]();
            delete this.events[key];
        }
        this.events = {};

        for (const key in this.member_events) {
            this.member_events[key]();
            delete this.member_events[key];
        }
        this.member_events = {};
    }
}
