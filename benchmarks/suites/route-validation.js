"use strict";

process.env.DATABASE ||= "postgres://bench:bench@127.0.0.1:1/bench";

const http = require("node:http");
const { createRequire } = require("node:module");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { percentile } = require("../../scripts/benchmarks/lib/stats");

const REQUESTS_PER_TRIAL = Number(process.env.BENCH_ROUTE_REQUESTS || 600);
const CONCURRENCY = Number(process.env.BENCH_ROUTE_CONCURRENCY || 32);

function messagePayload(iteration) {
    return {
        content: `benchmark route validation ${iteration}`,
        nonce: "900719925474099312345",
        tts: false,
        flags: 0,
        allowed_mentions: {
            parse: ["users"],
            users: ["111111111111111111", "222222222222222222"],
            roles: [],
            replied_user: false,
        },
        attachments: [
            {
                id: "0",
                filename: "benchmark.txt",
            },
        ],
    };
}

function requestRawJson(url, agent, payload) {
    const started = performance.now();

    return new Promise((resolve, reject) => {
        const req = http.request(
            url,
            {
                agent,
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(payload),
                },
            },
            (res) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    const latencyMs = performance.now() - started;
                    const responseBody = Buffer.concat(chunks).toString("utf8");
                    if (res.statusCode !== 200) {
                        reject(new Error(`Expected 200, got ${res.statusCode}: ${responseBody}`));
                        return;
                    }
                    resolve({ body: responseBody, latencyMs });
                });
            },
        );

        req.on("error", reject);
        req.end(payload);
    });
}

async function requestJson(url, agent, body) {
    const result = await requestRawJson(url, agent, JSON.stringify(body));
    return result.latencyMs;
}

async function runPool(ctx, url, agent) {
    const latencies = [];
    let next = 0;

    async function worker() {
        while (next < REQUESTS_PER_TRIAL) {
            next += 1;
            const iteration = next;
            latencies.push(await requestJson(url, agent, messagePayload(iteration + ctx.iteration * REQUESTS_PER_TRIAL)));
        }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, REQUESTS_PER_TRIAL) }, worker));
    return latencies;
}

module.exports = {
    name: "route-validation",
    kind: "pr",
    description: 'Express JSON body parsing plus route({ requestBody: "MessageCreateSchema" }) validation.',
    metrics: {
        requestsPerSecond: {
            label: "Requests/sec",
            unit: "req/s",
            direction: "higher",
            regressionThreshold: 0.15,
        },
        p50LatencyMs: {
            label: "p50 latency",
            unit: "ms",
            direction: "lower",
            regressionThreshold: 0.2,
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
        const bodyParserPath = path.join(ctx.repoRoot, "dist", "api", "middlewares", "BodyParser.js");
        const routePath = path.join(ctx.repoRoot, "dist", "api", "util", "handlers", "route.js");

        if (!require("node:fs").existsSync(bodyParserPath) || !require("node:fs").existsSync(routePath)) {
            throw new Error("Benchmark requires built dist files. Run npm run build:src first.");
        }

        const repoRequire = createRequire(path.join(ctx.repoRoot, "package.json"));
        const express = repoRequire("express");
        const { BodyParser } = require(bodyParserPath);
        const { route } = require(routePath);
        const app = express();

        app.post("/channels/:channel_id/messages", BodyParser({ inflate: true, limit: "128kb" }), route({ requestBody: "MessageCreateSchema" }), (req, res) => {
            res.json({
                ok: true,
                nonce: req.body.nonce,
                nonceType: typeof req.body.nonce,
            });
        });

        app.use((err, req, res, next) => {
            if (res.headersSent) return next(err);
            res.status(err.status || err.statusCode || 400).json({
                message: err.message,
            });
        });

        const server = http.createServer(app);
        await new Promise((resolve, reject) => {
            server.once("error", reject);
            server.listen(0, "127.0.0.1", resolve);
        });

        const address = server.address();
        const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

        ctx.routeValidation = {
            agent,
            server,
            url: `http://127.0.0.1:${address.port}/channels/123456789012345678/messages`,
        };

        await requestJson(ctx.routeValidation.url, agent, messagePayload(0));
        const unsafeNonceCheck = await requestRawJson(ctx.routeValidation.url, agent, '{"content":"unsafe nonce","nonce":900719925474099312345}');
        const unsafeNonceResponse = JSON.parse(unsafeNonceCheck.body);
        if (unsafeNonceResponse.nonceType !== "string") {
            throw new Error(`Expected route validation to normalize unsafe nonce to a string, got ${unsafeNonceCheck.body}`);
        }
    },
    async run(ctx) {
        const { agent, url } = ctx.routeValidation;
        const heapBefore = process.memoryUsage().heapUsed;
        const started = performance.now();
        const latencies = await runPool(ctx, url, agent);
        const durationMs = performance.now() - started;
        const heapAfter = process.memoryUsage().heapUsed;

        return {
            requestsPerSecond: latencies.length / (durationMs / 1000),
            p50LatencyMs: percentile(latencies, 50),
            p95LatencyMs: percentile(latencies, 95),
            p99LatencyMs: percentile(latencies, 99),
            heapUsedDeltaBytes: Math.max(0, heapAfter - heapBefore),
        };
    },
    async teardown(ctx) {
        if (!ctx.routeValidation) return;
        ctx.routeValidation.agent.destroy();
        await new Promise((resolve, reject) => {
            ctx.routeValidation.server.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    },
};
