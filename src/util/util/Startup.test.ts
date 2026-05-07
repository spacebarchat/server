import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handleClusterStartupFailure, initStartupConfigAndDatabase, runStartupOrExit, STARTUP_FAILURE_MESSAGE } from "./Startup";

describe("startup helpers", () => {
    it("initializes CONFIG_PATH configuration before the database", async () => {
        const calls: string[] = [];

        await initStartupConfigAndDatabase({
            configPath: "/tmp/config.json",
            initConfig: () => calls.push("config"),
            initDatabase: () => calls.push("database"),
        });

        assert.deepEqual(calls, ["config", "database"]);
    });

    it("initializes database configuration after the database", async () => {
        const calls: string[] = [];

        await initStartupConfigAndDatabase({
            configPath: "",
            initConfig: () => calls.push("config"),
            initDatabase: () => calls.push("database"),
        });

        assert.deepEqual(calls, ["database", "config"]);
    });

    it("does not initialize the database when CONFIG_PATH configuration fails", async () => {
        const calls: string[] = [];

        await assert.rejects(
            () =>
                initStartupConfigAndDatabase({
                    configPath: "/tmp/config.json",
                    initConfig: () => {
                        calls.push("config");
                        throw new Error("bad config");
                    },
                    initDatabase: () => calls.push("database"),
                }),
            /bad config/,
        );

        assert.deepEqual(calls, ["config"]);
    });

    it("exits non-zero when startup throws", async () => {
        const logs: unknown[][] = [];
        let exitCode: number | undefined;
        const error = new Error("startup failed");

        await runStartupOrExit(
            "test service",
            () => {
                throw error;
            },
            {
                exit: (code) => {
                    exitCode = code;
                },
                logError: (...args) => logs.push(args),
            },
        );

        assert.equal(exitCode, 1);
        assert.deepEqual(logs, [["[Startup] Failed to start test service."], [error]]);
    });

    it("exits a primary process on startup failure messages from cluster workers", () => {
        const logs: unknown[][] = [];
        let exitCode: number | undefined;

        const handled = handleClusterStartupFailure(
            { type: STARTUP_FAILURE_MESSAGE, serviceName: "test service" },
            {
                exit: (code) => {
                    exitCode = code;
                },
                logError: (...args) => logs.push(args),
                workerPid: 123,
            },
        );

        assert.equal(handled, true);
        assert.equal(exitCode, 1);
        assert.deepEqual(logs, [["[Startup] test service failed to start in worker 123; shutting down primary process."]]);
    });

    it("ignores unrelated cluster worker messages", () => {
        let exitCode: number | undefined;

        const handled = handleClusterStartupFailure(
            { type: "not-startup" },
            {
                exit: (code) => {
                    exitCode = code;
                },
            },
        );

        assert.equal(handled, false);
        assert.equal(exitCode, undefined);
    });
});
