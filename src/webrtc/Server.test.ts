import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ws, { type ServerOptions } from "ws";

type ServerWithInitializer = {
    initializeWebSocketServer: () => void;
};

class CapturingWebSocketServer {
    static options: ServerOptions[] = [];

    clients = new Set<{ close: () => void }>();

    constructor(options: ServerOptions) {
        CapturingWebSocketServer.options.push(options);
    }

    on() {
        return this;
    }

    close(callback?: () => void) {
        callback?.();
    }
}

describe("WebRTC Server", () => {
    it("uses the configured WebRTC message size as the ws transport cap", () => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar";

        const { Config, ConfigValue } = require("@spacebar/util") as typeof import("@spacebar/util");
        const { Server } = require("./Server") as typeof import("./Server");
        const originalWebSocketServer = ws.Server;
        const originalConfigGet = Config.get;
        const config = new ConfigValue();
        config.limits.webrtc.maxMessageSize = 4096;

        try {
            (ws as unknown as { Server: typeof CapturingWebSocketServer }).Server = CapturingWebSocketServer;
            (Config as unknown as { get: () => typeof config }).get = () => config;
            CapturingWebSocketServer.options = [];

            const server = new Server({ port: 0 }) as unknown as ServerWithInitializer;
            server.initializeWebSocketServer();
            server.initializeWebSocketServer();

            assert.equal(CapturingWebSocketServer.options.length, 1);
            assert.equal(CapturingWebSocketServer.options[0]?.maxPayload, 4096);
        } finally {
            (ws as unknown as { Server: typeof originalWebSocketServer }).Server = originalWebSocketServer;
            (Config as unknown as { get: typeof originalConfigGet }).get = originalConfigGet;
        }
    });
});
