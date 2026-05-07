import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Config } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { assertAdminConfigurationWritable, createConfigReloadEvent, parseAdminConfigurationUpdate, updateAdminConfiguration } from "./config";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

describe("admin configuration helpers", () => {
    test("rejects writes when JSON configuration is readonly", () => {
        assert.throws(
            () =>
                assertAdminConfigurationWritable({
                    source: "json",
                    path: "/tmp/config.json",
                    readonly: true,
                }),
            (error) => error instanceof HTTPError && error.code === 409,
        );
    });

    test("allows database and writable JSON configuration modes", () => {
        assert.doesNotThrow(() =>
            assertAdminConfigurationWritable({
                source: "database",
                path: null,
                readonly: true,
            }),
        );
        assert.doesNotThrow(() =>
            assertAdminConfigurationWritable({
                source: "json",
                path: "/tmp/config.json",
                readonly: false,
            }),
        );
    });

    test("accepts object configuration patches only", () => {
        assert.deepEqual(parseAdminConfigurationUpdate({ general: { instanceName: "Test" } }), {
            general: { instanceName: "Test" },
        });

        assert.throws(
            () => parseAdminConfigurationUpdate(null),
            (error) => error instanceof HTTPError && error.code === 400,
        );
        assert.throws(
            () => parseAdminConfigurationUpdate([]),
            (error) => error instanceof HTTPError && error.code === 400,
        );
    });

    test("builds the reload event expected by cross-process listeners", () => {
        assert.deepEqual(createConfigReloadEvent("test"), {
            event: "SB_RELOAD_CONFIG",
            guild_id: "0",
            data: {},
            origin: "test",
        });
    });

    test("configuration updates call Config.set and emit reload", async () => {
        const originalSet = Config.set;
        const updates: unknown[] = [];
        const events: unknown[] = [];

        try {
            Config.set = ((value: unknown) => {
                updates.push(value);
                return Promise.resolve(value);
            }) as typeof Config.set;

            await updateAdminConfiguration({ general: { instanceName: "Admin" } }, async (event) => {
                events.push(event);
            });

            assert.deepEqual(updates, [{ general: { instanceName: "Admin" } }]);
            assert.deepEqual(events, [
                {
                    event: "SB_RELOAD_CONFIG",
                    guild_id: "0",
                    data: {},
                    origin: "Admin API (PUT /configuration)",
                },
            ]);
        } finally {
            Config.set = originalSet;
        }
    });
});
