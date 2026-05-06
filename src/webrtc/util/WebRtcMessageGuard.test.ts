import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLOSECODES } from "../../gateway/util/Constants";
import {
    createWebRtcMessageGuard,
    createWebRtcMessageHandler,
    getRawDataByteLength,
    getWebRtcTransportMaxPayload,
    normalizeWebRtcGatewayLimits,
    rawDataToBuffer,
} from "./WebRtcMessageGuard";
import type { WebRtcWebSocket } from "./WebRtcWebSocket";

function createSocket() {
    const calls: { code: number; reason?: string }[] = [];
    return {
        socket: {
            close(code: number, reason?: string) {
                calls.push({ code, reason });
            },
        } as WebRtcWebSocket,
        calls,
    };
}

describe("WebRtcMessageGuard", () => {
    it("uses default gateway limits when config is partial", () => {
        assert.deepEqual(normalizeWebRtcGatewayLimits({ rateLimitCount: 1 }), {
            maxMessageSize: 64 * 1024,
            rateLimitCount: 1,
            rateLimitWindow: 60_000,
        });
    });

    it("uses the normalized WebRTC message size as the transport cap", () => {
        assert.equal(getWebRtcTransportMaxPayload(), 64 * 1024);
        assert.equal(getWebRtcTransportMaxPayload({ maxMessageSize: 4096 }), 4096);
        assert.equal(getWebRtcTransportMaxPayload({ rateLimitCount: 1 }), 64 * 1024);
    });

    it("calculates raw message sizes", () => {
        assert.equal(getRawDataByteLength("abc"), 3);
        assert.equal(getRawDataByteLength(Buffer.from("abc")), 3);
        assert.equal(getRawDataByteLength(new Uint8Array([1, 2, 3]).buffer), 3);
        assert.equal(getRawDataByteLength([Buffer.from("ab"), Buffer.from("cd")]), 4);
    });

    it("normalizes raw message data to buffers", () => {
        assert.deepEqual(rawDataToBuffer(Buffer.from("abc")), Buffer.from("abc"));
        assert.deepEqual(rawDataToBuffer(new Uint8Array([1, 2, 3]).buffer), Buffer.from([1, 2, 3]));
        assert.deepEqual(rawDataToBuffer([Buffer.from("ab"), Buffer.from("cd")]), Buffer.from("abcd"));
    });

    it("closes oversized messages before dispatch", () => {
        const { socket, calls } = createSocket();
        const guard = createWebRtcMessageGuard({
            maxMessageSize: 2,
            rateLimitCount: 10,
            rateLimitWindow: 1000,
        });

        assert.equal(guard(socket, Buffer.from("abc")), false);
        assert.deepEqual(calls, [
            {
                code: CLOSECODES.Decode_error,
                reason: "WebRTC message exceeds maximum size",
            },
        ]);
    });

    it("closes messages over the configured rate limit", () => {
        const { socket, calls } = createSocket();
        const guard = createWebRtcMessageGuard({
            maxMessageSize: 10,
            rateLimitCount: 2,
            rateLimitWindow: 1000,
        });

        assert.equal(guard(socket, Buffer.from("{}"), 1000), true);
        assert.equal(guard(socket, Buffer.from("{}"), 1100), true);
        assert.equal(guard(socket, Buffer.from("{}"), 1200), false);
        assert.deepEqual(calls, [
            {
                code: CLOSECODES.Rate_limited,
                reason: "WebRTC message rate limit exceeded",
            },
        ]);
    });

    it("forgets messages outside the configured rate window", () => {
        const { socket, calls } = createSocket();
        const guard = createWebRtcMessageGuard({
            maxMessageSize: 10,
            rateLimitCount: 2,
            rateLimitWindow: 1000,
        });

        assert.equal(guard(socket, Buffer.from("{}"), 1000), true);
        assert.equal(guard(socket, Buffer.from("{}"), 1100), true);
        assert.equal(guard(socket, Buffer.from("{}"), 2101), true);
        assert.deepEqual(calls, []);
    });

    it("does not dispatch blocked messages", async () => {
        const { socket } = createSocket();
        let dispatched = false;
        const handler = createWebRtcMessageHandler(
            socket,
            () => {
                dispatched = true;
            },
            {
                maxMessageSize: 2,
                rateLimitCount: 10,
                rateLimitWindow: 1000,
            },
        );

        await handler(Buffer.from("abc"));

        assert.equal(dispatched, false);
    });

    it("dispatches allowed messages", async () => {
        const { socket } = createSocket();
        let dispatched = false;
        const handler = createWebRtcMessageHandler(
            socket,
            () => {
                dispatched = true;
            },
            {
                maxMessageSize: 10,
                rateLimitCount: 10,
                rateLimitWindow: 1000,
            },
        );

        await handler(Buffer.from("{}"));

        assert.equal(dispatched, true);
    });
});
