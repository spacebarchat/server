"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { closeServer, createReservedServer, defaultEnv, overrideEnv, repoRequire, restoreEnv } = require("./lib/runtime");

function tempDir(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spacebar-benchmark-test-"));
    t.after(() => fs.rmSync(dir, { force: true, recursive: true }));
    return dir;
}

function writeFile(file, body) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
}

function preserveEnv(t, keys) {
    const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
    t.after(() => restoreEnv(previous));
}

function loadSuite(relativePath) {
    const suitePath = path.join(__dirname, "..", "..", relativePath);
    delete require.cache[require.resolve(suitePath)];
    return require(suitePath);
}

function createFakeFullstackRepo(t, serverBody) {
    const repoRoot = tempDir(t);

    writeFile(path.join(repoRoot, "package.json"), `${JSON.stringify({ name: "fake-benchmark-repo" })}\n`);
    writeFile(
        path.join(repoRoot, "node_modules", "express", "index.js"),
        `
            module.exports = function express() {
                return function app(_req, _res) {};
            };
        `,
    );
    writeFile(path.join(repoRoot, "dist", "api", "Server.js"), serverBody);
    writeFile(
        path.join(repoRoot, "dist", "util", "util", "Database.js"),
        `
            module.exports = {
                closeDatabase: async () => {
                    module.exports.closed = true;
                },
            };
        `,
    );

    return repoRoot;
}

test("repoRequire resolves dependencies from the benchmarked repo root", (t) => {
    const repoRoot = tempDir(t);
    writeFile(path.join(repoRoot, "package.json"), `${JSON.stringify({ name: "repo-require-test" })}\n`);
    writeFile(path.join(repoRoot, "node_modules", "benchmark-dependency", "index.js"), "module.exports = { value: 'repo-root-dependency' };\n");

    assert.equal(repoRequire(repoRoot, "benchmark-dependency").value, "repo-root-dependency");
});

test("benchmark env helpers restore overwritten and deleted variables", (t) => {
    const keys = ["BENCH_TEST_EXISTING", "BENCH_TEST_NEW", "BENCH_TEST_DELETE", "BENCH_TEST_DEFAULT"];
    preserveEnv(t, keys);

    process.env.BENCH_TEST_EXISTING = "old";
    process.env.BENCH_TEST_DELETE = "remove-me";
    delete process.env.BENCH_TEST_NEW;
    delete process.env.BENCH_TEST_DEFAULT;

    const overridden = overrideEnv({
        BENCH_TEST_DELETE: undefined,
        BENCH_TEST_EXISTING: "new",
        BENCH_TEST_NEW: "created",
    });

    assert.equal(process.env.BENCH_TEST_EXISTING, "new");
    assert.equal(process.env.BENCH_TEST_NEW, "created");
    assert.equal(process.env.BENCH_TEST_DELETE, undefined);

    restoreEnv(overridden);

    assert.equal(process.env.BENCH_TEST_EXISTING, "old");
    assert.equal(process.env.BENCH_TEST_NEW, undefined);
    assert.equal(process.env.BENCH_TEST_DELETE, "remove-me");

    const defaulted = defaultEnv({
        BENCH_TEST_DEFAULT: "created-default",
        BENCH_TEST_EXISTING: "should-not-overwrite",
    });

    assert.equal(process.env.BENCH_TEST_DEFAULT, "created-default");
    assert.equal(process.env.BENCH_TEST_EXISTING, "old");

    restoreEnv(defaulted);

    assert.equal(process.env.BENCH_TEST_DEFAULT, undefined);
    assert.equal(process.env.BENCH_TEST_EXISTING, "old");
});

test("createReservedServer uses an OS-assigned port and closeServer releases it", async () => {
    const { port, server } = await createReservedServer((_req, res) => res.end("ok"));

    assert.equal(server.listening, true);
    assert.equal(Number.isInteger(port), true);
    assert.equal(port > 0, true);

    const response = await new Promise((resolve, reject) => {
        const req = http.request(`http://127.0.0.1:${port}/`, (res) => {
            const chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });
        req.on("error", reject);
        req.end();
    });

    assert.equal(response, "ok");

    await closeServer(server);
    assert.equal(server.listening, false);
});

test("route-validation suite load does not install a dummy DATABASE globally", (t) => {
    preserveEnv(t, ["DATABASE"]);
    delete process.env.DATABASE;

    loadSuite("benchmarks/suites/route-validation.js");

    assert.equal(process.env.DATABASE, undefined);
});

test("fullstack-readyz setup overrides and teardown restores benchmark environment", async (t) => {
    preserveEnv(t, ["BENCH_FULLSTACK_STARTUP_SETTLE_MS", "CONFIG_PATH", "CONFIG_READONLY", "DATABASE", "LOG_REQUESTS", "LOG_ROUTES"]);
    process.env.BENCH_FULLSTACK_STARTUP_SETTLE_MS = "0";
    process.env.CONFIG_PATH = "/tmp/original-spacebar-config.json";
    process.env.CONFIG_READONLY = "0";
    process.env.DATABASE = "postgres://spacebar:spacebar@127.0.0.1:5432/spacebar";
    process.env.LOG_REQUESTS = "200";
    process.env.LOG_ROUTES = "true";

    const repoRoot = createFakeFullstackRepo(
        t,
        `
            class SpacebarServer {
                constructor(options) {
                    this.options = options;
                    this.http = options.server;
                }

                async start() {
                    this.http.on("request", (req, res) => {
                        if (req.url === "/readyz") {
                            res.statusCode = 200;
                            res.end("ok");
                        }
                    });
                }

                stop() {
                    return new Promise((resolve, reject) => {
                        this.http.close((error) => (error ? reject(error) : resolve()));
                    });
                }
            }

            module.exports = { SpacebarServer };
        `,
    );
    const suite = loadSuite("benchmarks/suites/fullstack-readyz.js");
    const ctx = { repoRoot };

    await suite.setup(ctx);

    const configPath = ctx.fullstackReadyz.configPath;
    const configDir = ctx.fullstackReadyz.configDir;
    const port = ctx.fullstackReadyz.server.options.port;
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    assert.equal(process.env.CONFIG_PATH, configPath);
    assert.equal(process.env.CONFIG_READONLY, "1");
    assert.equal(process.env.LOG_REQUESTS, undefined);
    assert.equal(process.env.LOG_ROUTES, "false");
    assert.equal(new URL(config.api.endpointPublic).port, String(port));

    await suite.teardown(ctx);

    assert.equal(process.env.CONFIG_PATH, "/tmp/original-spacebar-config.json");
    assert.equal(process.env.CONFIG_READONLY, "0");
    assert.equal(process.env.LOG_REQUESTS, "200");
    assert.equal(process.env.LOG_ROUTES, "true");
    assert.equal(fs.existsSync(configDir), false);
});

test("fullstack-readyz teardown cleans reserved server and temp config after setup failure", async (t) => {
    preserveEnv(t, ["BENCH_FULLSTACK_STARTUP_SETTLE_MS", "CONFIG_PATH", "CONFIG_READONLY", "DATABASE", "LOG_REQUESTS", "LOG_ROUTES"]);
    process.env.BENCH_FULLSTACK_STARTUP_SETTLE_MS = "0";
    process.env.CONFIG_PATH = "/tmp/original-spacebar-config.json";
    process.env.CONFIG_READONLY = "0";
    process.env.DATABASE = "postgres://spacebar:spacebar@127.0.0.1:5432/spacebar";
    process.env.LOG_REQUESTS = "200";
    process.env.LOG_ROUTES = "true";

    const repoRoot = createFakeFullstackRepo(
        t,
        `
            class SpacebarServer {
                constructor(options) {
                    this.options = options;
                    this.http = options.server;
                }

                async start() {
                    throw new Error("intentional start failure");
                }
            }

            module.exports = { SpacebarServer };
        `,
    );
    const suite = loadSuite("benchmarks/suites/fullstack-readyz.js");
    const ctx = { repoRoot };

    await assert.rejects(() => suite.setup(ctx), /intentional start failure/);

    const configDir = ctx.fullstackReadyz.configDir;
    assert.equal(ctx.fullstackReadyz.reservedServer.listening, true);
    assert.equal(fs.existsSync(configDir), true);

    await suite.teardown(ctx);

    assert.equal(ctx.fullstackReadyz.reservedServer.listening, false);
    assert.equal(fs.existsSync(configDir), false);
    assert.equal(process.env.CONFIG_PATH, "/tmp/original-spacebar-config.json");
    assert.equal(process.env.CONFIG_READONLY, "0");
    assert.equal(process.env.LOG_REQUESTS, "200");
    assert.equal(process.env.LOG_ROUTES, "true");
});
