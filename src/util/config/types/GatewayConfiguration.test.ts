import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GatewayConfiguration } from "./GatewayConfiguration";

describe("GatewayConfiguration", () => {
    it("keeps endpoint settings and adds heartbeat timeout defaults", () => {
        const config = new GatewayConfiguration();

        assert.equal(config.endpointPrivate, null);
        assert.equal(config.endpointPublic, null);
        assert.equal(config.heartbeatTimeout, 45_000);
    });
});
