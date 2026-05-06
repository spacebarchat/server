import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";

type Entrypoint = "api" | "cdn" | "gateway" | "webrtc" | "bundle";

const repoRoot = path.resolve(__dirname, "../../..");
const entrypoints: Entrypoint[] = ["api", "cdn", "gateway", "webrtc", "bundle"];

interface StartupResult {
    code: number | null;
    output: string;
    signal: NodeJS.Signals | null;
    timedOut: boolean;
}

const runEntrypoint = async (entrypoint: Entrypoint, envOverrides: NodeJS.ProcessEnv): Promise<StartupResult> => {
    const childEnv = {
        ...process.env,
        APPLY_DB_MIGRATIONS: "false",
        CONFIG_PATH: "",
        DATABASE: "",
        LOG_ROUTES: "false",
        NODE_ENV: "test",
        THREADS: "1",
        ...envOverrides,
    };

    const child = spawn(process.execPath, ["--enable-source-maps", path.join(repoRoot, "dist", entrypoint, "start.js")], {
        cwd: repoRoot,
        env: childEnv,
        stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
    }, 10000);

    child.stdout.on("data", (data) => {
        output += data;
    });
    child.stderr.on("data", (data) => {
        output += data;
    });

    return new Promise((resolve) => {
        child.on("close", (code, signal) => {
            clearTimeout(timeout);
            resolve({ code, output, signal, timedOut });
        });
    });
};

describe("standalone startup entrypoints", () => {
    for (const entrypoint of entrypoints) {
        it(`${entrypoint} exits non-zero when DATABASE is missing`, async () => {
            const result = await runEntrypoint(entrypoint, {});

            assert.equal(result.timedOut, false, `${entrypoint} did not exit before timeout. Output:\n${result.output}`);
            assert.equal(result.code, 1, `${entrypoint} should exit 1. Signal: ${result.signal ?? "none"} Output:\n${result.output}`);
            assert.match(result.output, /DATABASE environment variable not set!/, result.output);
            assert.doesNotMatch(result.output, /Listening on port|started on :|online on 0\.0\.0\.0/i, result.output);
        });

        it(`${entrypoint} reports CONFIG_PATH errors before DATABASE errors`, async () => {
            const missingConfigPath = path.join(repoRoot, "files", `missing-${entrypoint}-config.json`);
            const result = await runEntrypoint(entrypoint, { CONFIG_PATH: missingConfigPath });

            assert.equal(result.timedOut, false, `${entrypoint} did not exit before timeout. Output:\n${result.output}`);
            assert.equal(result.code, 1, `${entrypoint} should exit 1. Signal: ${result.signal ?? "none"} Output:\n${result.output}`);
            assert.match(result.output, new RegExp(`CONFIG_PATH file does not exist: ${missingConfigPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), result.output);
            assert.doesNotMatch(result.output, /DATABASE environment variable not set!/, result.output);
            assert.doesNotMatch(result.output, /Listening on port|started on :|online on 0\.0\.0\.0/i, result.output);
        });
    }
});

describe("clustered startup entrypoints", () => {
    const clusteredEntrypoints: { entrypoint: Entrypoint; env: NodeJS.ProcessEnv; name: string }[] = [
        { entrypoint: "api", env: { NODE_ENV: "production", THREADS: "1" }, name: "api production primary" },
        { entrypoint: "bundle", env: { THREADS: "2" }, name: "bundle primary" },
    ];

    for (const { entrypoint, env, name } of clusteredEntrypoints) {
        it(`${name} exits non-zero when a worker startup fails`, async () => {
            const result = await runEntrypoint(entrypoint, env);

            assert.equal(result.timedOut, false, `${name} did not exit before timeout. Output:\n${result.output}`);
            assert.equal(result.code, 1, `${name} should exit 1. Signal: ${result.signal ?? "none"} Output:\n${result.output}`);
            assert.match(result.output, /DATABASE environment variable not set!/, result.output);
            assert.match(result.output, /shutting down primary process/, result.output);
        });

        it(`${name} reports worker CONFIG_PATH errors before DATABASE errors`, async () => {
            const missingConfigPath = path.join(repoRoot, "files", `missing-${entrypoint}-cluster-config.json`);
            const result = await runEntrypoint(entrypoint, { ...env, CONFIG_PATH: missingConfigPath });

            assert.equal(result.timedOut, false, `${name} did not exit before timeout. Output:\n${result.output}`);
            assert.equal(result.code, 1, `${name} should exit 1. Signal: ${result.signal ?? "none"} Output:\n${result.output}`);
            assert.match(result.output, new RegExp(`CONFIG_PATH file does not exist: ${missingConfigPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), result.output);
            assert.doesNotMatch(result.output, /DATABASE environment variable not set!/, result.output);
            assert.match(result.output, /shutting down primary process/, result.output);
        });
    }
});
