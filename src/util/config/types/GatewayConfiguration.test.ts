import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT, GATEWAY_HEARTBEAT_INTERVAL, GatewayConfiguration, isValidGatewayHeartbeatTimeout } from "./GatewayConfiguration";

describe("GatewayConfiguration", () => {
    it("keeps endpoint settings and adds heartbeat timeout defaults", () => {
        const config = new GatewayConfiguration();

        assert.equal(config.endpointPrivate, null);
        assert.equal(config.endpointPublic, null);
        assert.equal(config.heartbeatTimeout, DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT);
        assert.equal(DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT, 45_000);
        assert.equal(GATEWAY_HEARTBEAT_INTERVAL, 30_000);
    });

    it("rejects timeout values that would close before the advertised heartbeat interval", () => {
        assert.equal(isValidGatewayHeartbeatTimeout(GATEWAY_HEARTBEAT_INTERVAL + 1), true);
        assert.equal(isValidGatewayHeartbeatTimeout(GATEWAY_HEARTBEAT_INTERVAL), false);
        assert.equal(isValidGatewayHeartbeatTimeout(0), false);
        assert.equal(isValidGatewayHeartbeatTimeout(-1), false);
        assert.equal(isValidGatewayHeartbeatTimeout(null), false);
        assert.equal(isValidGatewayHeartbeatTimeout(Number.NaN), false);
        assert.equal(isValidGatewayHeartbeatTimeout(Number.POSITIVE_INFINITY), false);
        assert.equal(isValidGatewayHeartbeatTimeout("45000"), false);
    });
});
