import { CLOSECODES } from "../../gateway/util/Constants";
import type { RawData } from "ws";
import type { WebRtcWebSocket } from "./WebRtcWebSocket";

export type WebRtcGatewayLimits = {
    maxMessageSize: number;
    rateLimitCount: number;
    rateLimitWindow: number;
};

export type WebRtcMessageHandler = (data: Buffer) => unknown;

const DEFAULT_WEBRTC_GATEWAY_LIMITS: WebRtcGatewayLimits = {
    maxMessageSize: 64 * 1024,
    rateLimitCount: 120,
    rateLimitWindow: 60_000,
};

const messageTimestamps = new WeakMap<WebRtcWebSocket, number[]>();

export function getRawDataByteLength(data: RawData | string): number {
    if (typeof data === "string") return Buffer.byteLength(data);
    if (Buffer.isBuffer(data)) return data.byteLength;
    if (data instanceof ArrayBuffer) return data.byteLength;
    return data.reduce((total, item) => total + item.byteLength, 0);
}

export function rawDataToBuffer(data: RawData): Buffer {
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof ArrayBuffer) return Buffer.from(data);
    return Buffer.concat(data);
}

export function normalizeWebRtcGatewayLimits(limits?: Partial<WebRtcGatewayLimits>): WebRtcGatewayLimits {
    return {
        maxMessageSize: limits?.maxMessageSize ?? DEFAULT_WEBRTC_GATEWAY_LIMITS.maxMessageSize,
        rateLimitCount: limits?.rateLimitCount ?? DEFAULT_WEBRTC_GATEWAY_LIMITS.rateLimitCount,
        rateLimitWindow: limits?.rateLimitWindow ?? DEFAULT_WEBRTC_GATEWAY_LIMITS.rateLimitWindow,
    };
}

export function getWebRtcTransportMaxPayload(limits?: Partial<WebRtcGatewayLimits>) {
    return normalizeWebRtcGatewayLimits(limits).maxMessageSize;
}

export function createWebRtcMessageGuard(limits?: Partial<WebRtcGatewayLimits>) {
    const normalized = normalizeWebRtcGatewayLimits(limits);

    return (socket: WebRtcWebSocket, data: RawData | string, now = Date.now()) => {
        if (getRawDataByteLength(data) > normalized.maxMessageSize) {
            socket.close(CLOSECODES.Decode_error, "WebRTC message exceeds maximum size");
            return false;
        }

        const windowStart = now - normalized.rateLimitWindow;
        const timestamps = (messageTimestamps.get(socket) ?? []).filter((timestamp) => timestamp > windowStart);
        if (timestamps.length >= normalized.rateLimitCount) {
            socket.close(CLOSECODES.Rate_limited, "WebRTC message rate limit exceeded");
            return false;
        }

        timestamps.push(now);
        messageTimestamps.set(socket, timestamps);
        return true;
    };
}

export function createWebRtcMessageHandler(socket: WebRtcWebSocket, handler: WebRtcMessageHandler, limits?: Partial<WebRtcGatewayLimits>) {
    const guard = createWebRtcMessageGuard(limits);
    return async (data: RawData) => {
        if (!guard(socket, data)) return;
        return await handler(rawDataToBuffer(data));
    };
}
