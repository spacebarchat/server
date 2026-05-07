import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { readJsonConfigFile } from "./JsonConfigFile";

const withTempDir = async (callback: (dir: string) => Promise<void>) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "spacebar-config-test-"));

    try {
        await callback(dir);
    } finally {
        await fs.rm(dir, { force: true, recursive: true });
    }
};

describe("readJsonConfigFile", () => {
    it("reads a JSON object", async () => {
        await withTempDir(async (dir) => {
            const configPath = path.join(dir, "config.json");
            await fs.writeFile(configPath, JSON.stringify({ general: { serverName: "localhost" } }));

            assert.deepEqual(await readJsonConfigFile(configPath), {
                general: { serverName: "localhost" },
            });
        });
    });

    it("fails clearly when CONFIG_PATH is missing", async () => {
        await withTempDir(async (dir) => {
            const configPath = path.join(dir, "missing.json");

            await assert.rejects(() => readJsonConfigFile(configPath), {
                message: `[Config] CONFIG_PATH file does not exist: ${configPath}. Create the file or unset CONFIG_PATH to load configuration from the database.`,
            });
        });
    });

    it("fails clearly when CONFIG_PATH JSON is malformed", async () => {
        await withTempDir(async (dir) => {
            const configPath = path.join(dir, "config.json");
            await fs.writeFile(configPath, "{\n  bad\n}");

            await assert.rejects(
                () => readJsonConfigFile(configPath),
                (error) => {
                    assert.match((error as Error).message, new RegExp(`^\\[Config\\] Failed to parse CONFIG_PATH JSON '${configPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}':`));
                    assert.match((error as Error).message, /line 2, column/);
                    return true;
                },
            );
        });
    });

    it("requires the JSON document to be an object", async () => {
        await withTempDir(async (dir) => {
            const configPath = path.join(dir, "config.json");
            await fs.writeFile(configPath, "[]");

            await assert.rejects(() => readJsonConfigFile(configPath), {
                message: `[Config] CONFIG_PATH must contain a JSON object: ${configPath}`,
            });
        });
    });
});
