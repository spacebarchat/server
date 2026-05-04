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

/* eslint-disable @typescript-eslint/ban-ts-comment */
import WS from "ws";
import { genSessionId, WebSocket } from "@spacebar/gateway";
import { Send } from "../util/Send";
import { CLOSECODES, OPCODES } from "../util/Constants";
import { setHeartbeat } from "../util/Heartbeat";
import { IncomingMessage } from "node:http";
import { Close } from "./Close";
import { Message } from "./Message";
import { Deflate, Inflate } from "fast-zlib";
import { URL } from "node:url";
import { Config } from "@spacebar/util";
import { Decoder, Encoder } from "@toondepauw/node-zstd";
import { deflate } from "node:zlib";

// TODO: check rate limit
// TODO: specify rate limit in config
// TODO: check msg max size

export const openConnections: WebSocket[] = [];

export async function Connection(this: WS.Server, socket: WebSocket, request: IncomingMessage) {
    openConnections.push(socket);
    socket.on("close", () => {
        const index = openConnections.indexOf(socket);
        if (index !== -1) openConnections.splice(index, 1);
    });

    const forwardedFor = Config.get().security.forwardedFor;
    const ipAddress = forwardedFor ? (request.headers[forwardedFor.toLowerCase()] as string) : request.socket.remoteAddress;

    socket.ipAddress = ipAddress;
    socket.userAgent = request.headers["user-agent"] as string;

    if (!ipAddress && Config.get().security.cdnSignatureIncludeIp) {
        console.error("Gateway connection rejected: No IP address found.");
        return socket.close(CLOSECODES.Decode_error, "Gateway connection rejected: IP address is required.");
    }

    if (!socket.userAgent && Config.get().security.cdnSignatureIncludeUserAgent) {
        console.error("Gateway connection rejected: No User-Agent header found.");
        return socket.close(CLOSECODES.Decode_error, "Gateway connection rejected: User-Agent header is required.");
    }

    if (request.headers.cookie?.split("; ").find((x) => x.startsWith("__sb_sessid="))) {
        socket.fingerprint = request.headers.cookie
            .split("; ")
            .find((x) => x.startsWith("__sb_sessid="))
            ?.split("=")[1];
    }

    //Create session ID when the connection is opened. This allows gateway dump to group the initial websocket messages with the rest of the conversation.
    socket.session_id = "TEMP_" + genSessionId(); //Set the session of the WebSocket object

    try {
        // @ts-ignore
        socket.on("close", Close);
        // @ts-ignore
        socket.on("message", Message);

        socket.on("error", (err) => console.error(`[Gateway/${socket.user_id ?? socket.ipAddress}]`, err));

        console.log(`[Gateway] New connection from ${ipAddress}, total ${this.clients.size}`);

        if (process.env.WS_LOGEVENTS)
            [
                "close",
                "error",
                "upgrade",
                //"message",
                "open",
                "ping",
                "pong",
                "unexpected-response",
            ].forEach((x) => {
                socket.on(x, (y) => console.log(x, y));
            });

        const { searchParams } = new URL(`http://localhost${request.url}`);
        // @ts-ignore
        socket.encoding = searchParams.get("encoding") || "json";
        // @ts-ignore
        socket.compress = searchParams.get("compress") || "";
        socket.version = Number(searchParams.get("version")) || 8;

        if (socket.version != 8) {
            console.error(`[Gateway/${socket.ipAddress}] Invalid API version: ${socket.version}`);
            return socket.close(CLOSECODES.Invalid_API_version);
        }

        await setupMessageEncoding(socket);

        socket.recentTransactions = [];
        socket.events = {};
        socket.member_events = {};
        socket.permissions = {};
        socket.sequence = 0;

        setHeartbeat(socket);

        await Send(socket, {
            op: OPCODES.Hello,
            d: {
                heartbeat_interval: 1000 * 30,
            },
        });

        socket.readyTimeout = setTimeout(() => socket.close(CLOSECODES.Session_timed_out), 1000 * 30);
    } catch (error) {
        console.error(error);
        return socket.close(CLOSECODES.Unknown_error);
    }
}

export async function setupMessageEncoding(socket: WebSocket) {
    if (!["json", "etf"].includes(socket.encoding)) {
        console.error(`[Gateway/${socket.ipAddress}] Unknown encoding: ${socket.encoding}`);
        return socket.close(CLOSECODES.Decode_error);
    }

    // if (socket.encoding === "etf" && !erlpack) throw new Error("Erlpack is not installed: 'npm i @yukikaze-bot/erlpack'");

    if (socket.compress) {
        if (socket.compress === "zlib-stream") {
            socket.encodeProcessor = new ZlibStreamDeflateOperator();
            socket.decodeProcessor = new ZlibStreamInflateOperator();
            // socket.deflate = new Deflate();
            // socket.inflate = new Inflate();
        } else if (socket.compress === "zstd-stream") {
            // socket.zstdEncoder = new Encoder(6);
            // socket.zstdDecoder = new Decoder();
            socket.encodeProcessor = new ZstdStreamDeflateOperator();
            socket.decodeProcessor = new ZstdStreamInflateOperator();
        } else {
            console.error(`[Gateway/${socket.user_id}] Unknown compression: ${socket.compress}`);
            return socket.close(CLOSECODES.Decode_error);
        }
    }
}

// hopefully this makes stuff more extensible in the future
export abstract class DataPipelineOperator {
    preProcessor?: DataPipelineOperator;
    abstract process(data: ArrayBufferLike): Promise<ArrayBufferLike>;
    // default implementation:
    async dispose(): Promise<void> {
        await this.preProcessor?.dispose();
    }

    constructor(preProcessor?: DataPipelineOperator) {
        this.preProcessor = preProcessor;
    }
}

class ZlibStreamDeflateOperator extends DataPipelineOperator {
    #deflater = new Deflate();
    async process(data: ArrayBufferLike): Promise<ArrayBufferLike> {
        if (this.preProcessor) data = await this.preProcessor.process(data);
        return Promise.try(() => {
            const deflatedBuffer = this.#deflater.process(data);
            return bufferToArrayBuffer(deflatedBuffer);
        });
    }
    async dispose() {
        this.#deflater.close();
        await super.dispose?.();
    }
}
class ZlibStreamInflateOperator extends DataPipelineOperator {
    #inflater = new Inflate();
    async process(data: ArrayBufferLike): Promise<ArrayBufferLike> {
        if (this.preProcessor) data = await this.preProcessor.process(data);
        return Promise.try(() => {
            const deflatedBuffer = this.#inflater.process(data);
            return bufferToArrayBuffer(deflatedBuffer);
        });
    }
    async dispose() {
        this.#inflater.close();
        await super.dispose?.();
    }
}

class ZstdStreamDeflateOperator extends DataPipelineOperator {
    #deflater = new Encoder(6);
    async process(data: ArrayBufferLike): Promise<ArrayBufferLike> {
        if (this.preProcessor) data = await this.preProcessor.process(data);
        const deflatedBuffer = await this.#deflater.encode(arrayBufferToBuffer(data));
        return bufferToArrayBuffer(deflatedBuffer);
    }
    // Dispose: the ZSTD Encoder has no dispose signature
}
class ZstdStreamInflateOperator extends DataPipelineOperator {
    #inflater = new Decoder();
    async process(data: ArrayBufferLike): Promise<ArrayBufferLike> {
        if (this.preProcessor) data = await this.preProcessor.process(data);
        const deflatedBuffer = await this.#inflater.decode(arrayBufferToBuffer(data));
        return bufferToArrayBuffer(deflatedBuffer);
    }
    // Dispose: the ZSTD Decoder has no dispose signature
}

// Yes, this is slightly inefficient, but allows us to have a consistent API for the data pipeline operators...
function bufferToArrayBuffer(data: Buffer): ArrayBufferLike {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

function arrayBufferToBuffer(data: ArrayBufferLike): Buffer {
    return Buffer.from(data);
}
