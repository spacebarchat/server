import { EndpointConfiguration } from "./EndpointConfiguration";

export const GATEWAY_HEARTBEAT_INTERVAL = 30_000;
export const DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT = 45_000;

export function isValidGatewayHeartbeatTimeout(timeout: unknown): timeout is number {
    return typeof timeout === "number" && Number.isFinite(timeout) && timeout > GATEWAY_HEARTBEAT_INTERVAL;
}

export class GatewayConfiguration extends EndpointConfiguration {
    heartbeatTimeout: number = DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT;
}
