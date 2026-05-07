export class WebRtcLimits {
    /** Maximum inbound WebRTC websocket signaling payload size, in bytes. */
    maxMessageSize: number = 64 * 1024;
    /** Maximum inbound WebRTC websocket messages per rateLimitWindow. */
    rateLimitCount: number = 120;
    /** WebRTC websocket message rate limit window, in milliseconds. */
    rateLimitWindow: number = 60_000;
}
