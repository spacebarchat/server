"use strict";

const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { percentile } = require("../../scripts/benchmarks/lib/stats");

const REQUESTS_PER_TRIAL = Number(process.env.BENCH_FULLSTACK_REQUESTS || 300);
const CONCURRENCY = Number(process.env.BENCH_FULLSTACK_CONCURRENCY || 16);
const STARTUP_SETTLE_MS = Number(process.env.BENCH_FULLSTACK_STARTUP_SETTLE_MS || 1000);

function randomPort() {
    return 30000 + Math.floor(Math.random() * 20000);
}

function benchmarkConfig(port) {
    return {
        general: {
            serverName: `http://localhost:${port}`,
        },
        api: {
            endpointPublic: `http://localhost:${port}/api/v9`,
        },
        cdn: {
            endpointPrivate: `http://localhost:${port}`,
            endpointPublic: `http://localhost:${port}`,
        },
        gateway: {
            endpointPublic: `ws://localhost:${port}`,
        },
    };
}

function get(url, agent) {
    const started = performance.now();

    return new Promise((resolve, reject) => {
        const req = http.request(url, { agent, method: "GET" }, (res) => {
            res.resume();
            res.on("end", () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Expected 200 from ${url}, got ${res.statusCode}`));
                    return;
                }
                resolve(performance.now() - started);
            });
        });

        req.on("error", reject);
        req.end();
    });
}

async function runPool(ctx, url, agent) {
    const latencies = [];
    let next = 0;

    async function worker() {
        while (next < REQUESTS_PER_TRIAL) {
            next += 1;
            latencies.push(await get(url, agent));
        }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, REQUESTS_PER_TRIAL) }, worker));
    return latencies;
}

module.exports = {
    name: "fullstack-readyz",
    kind: "fullstack",
    description: "Starts the API server against Postgres and measures the ready endpoint.",
    metrics: {
        requestsPerSecond: {
            label: "Requests/sec",
            unit: "req/s",
            direction: "higher",
            regressionThreshold: 0.15,
        },
        p95LatencyMs: {
            label: "p95 latency",
            unit: "ms",
            direction: "lower",
            regressionThreshold: 0.2,
        },
        p99LatencyMs: {
            label: "p99 latency",
            unit: "ms",
            direction: "lower",
            regressionThreshold: 0.2,
        },
        heapUsedDeltaBytes: {
            label: "Heap delta",
            unit: "bytes",
            direction: "lower",
            regressionThreshold: 0.25,
        },
    },
    async setup(ctx) {
        if (!process.env.DATABASE) {
            throw new Error("fullstack-readyz requires DATABASE to point at a Postgres database");
        }

        const port = randomPort();
        const configPath = path.join(os.tmpdir(), `spacebar-benchmark-config-${process.pid}.json`);
        fs.writeFileSync(configPath, `${JSON.stringify(benchmarkConfig(port), null, 4)}\n`);

        process.env.CONFIG_PATH ||= configPath;
        process.env.CONFIG_READONLY ||= "1";
        process.env.LOG_ROUTES ||= "false";
        delete process.env.LOG_REQUESTS;

        const serverPath = path.join(ctx.repoRoot, "dist", "api", "Server.js");
        if (!fs.existsSync(serverPath)) throw new Error("fullstack-readyz requires built dist files. Run npm run build:src first.");

        const { SpacebarServer } = require(serverPath);
        const server = new SpacebarServer({
            host: "127.0.0.1",
            port,
            serverInitLogging: false,
        });

        await server.start();
        await new Promise((resolve) => setTimeout(resolve, STARTUP_SETTLE_MS));

        const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });
        const url = `http://127.0.0.1:${server.options.port}/readyz`;
        await get(url, agent);

        ctx.fullstackReadyz = {
            agent,
            server,
            url,
        };
    },
    async run(ctx) {
        const { agent, url } = ctx.fullstackReadyz;
        const heapBefore = process.memoryUsage().heapUsed;
        const started = performance.now();
        const latencies = await runPool(ctx, url, agent);
        const durationMs = performance.now() - started;
        const heapAfter = process.memoryUsage().heapUsed;

        return {
            requestsPerSecond: latencies.length / (durationMs / 1000),
            p95LatencyMs: percentile(latencies, 95),
            p99LatencyMs: percentile(latencies, 99),
            heapUsedDeltaBytes: Math.max(0, heapAfter - heapBefore),
        };
    },
    async teardown(ctx) {
        if (!ctx.fullstackReadyz) return;

        ctx.fullstackReadyz.agent.destroy();
        await ctx.fullstackReadyz.server.stop();

        const { closeDatabase } = require(path.join(ctx.repoRoot, "dist", "util", "util", "Database.js"));
        await closeDatabase();
    },
};
