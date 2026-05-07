#!/usr/bin/env node
"use strict";

require("module-alias/register");

const fs = require("node:fs");
const http = require("node:http");
const inspector = require("node:inspector");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { fileURLToPath } = require("node:url");
const express = require("express");
const { BodyParser, ErrorHandler, route } = require("@spacebar/api");

const outputDir = path.resolve(process.env.BENCH_OUTPUT_DIR || "benchmarks/results/route-validation");
const label = process.env.BENCH_LABEL || new Date().toISOString().replace(/[:.]/g, "-");
const requests = parseInt(process.env.BENCH_REQUESTS || "20000", 10);
const concurrency = parseInt(process.env.BENCH_CONCURRENCY || "40", 10);
const warmupRequests = parseInt(process.env.BENCH_WARMUP_REQUESTS || "1000", 10);
const embeds = parseInt(process.env.BENCH_EMBEDS || "10", 10);
const fieldsPerEmbed = parseInt(process.env.BENCH_FIELDS_PER_EMBED || "25", 10);

function toPosixPath(value) {
    return value.split(path.sep).join(path.posix.sep);
}

function normalizeProfileUrl(url) {
    if (!url) return "";

    let filePath;
    if (url.startsWith("file://")) {
        filePath = fileURLToPath(url);
    } else if (path.isAbsolute(url)) {
        filePath = url;
    } else {
        return url;
    }

    const relativePath = path.relative(process.cwd(), filePath);
    if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
        return toPosixPath(relativePath);
    }

    const posixPath = toPosixPath(filePath);
    for (const stableRoot of ["node_modules/", "dist/", "src/", "scripts/", "benchmarks/"]) {
        const stableRootIndex = posixPath.lastIndexOf(stableRoot);
        if (stableRootIndex !== -1) return posixPath.slice(stableRootIndex);
    }

    return path.posix.basename(posixPath);
}

function normalizeProfileCallFrame(callFrame) {
    if (!callFrame?.url) return;
    callFrame.url = normalizeProfileUrl(callFrame.url);
}

function normalizeCpuProfile(profile) {
    for (const node of profile.nodes || []) {
        normalizeProfileCallFrame(node.callFrame);
    }
}

function normalizeHeapProfile(profile) {
    function visit(node) {
        if (!node) return;
        normalizeProfileCallFrame(node.callFrame);
        for (const child of node.children || []) visit(child);
    }

    visit(profile.head);
}

function makePayload() {
    const fields = Array.from({ length: fieldsPerEmbed }, (_, index) => ({
        name: `field-${index}`,
        value: "value ".repeat(20),
        inline: index % 2 === 0,
    }));

    return JSON.stringify({
        content: "benchmark message",
        nonce: "route-validation-benchmark",
        tts: false,
        embeds: Array.from({ length: embeds }, (_, index) => ({
            title: `embed-${index}`,
            type: "rich",
            description: "description ".repeat(50),
            url: "https://spacebar.chat",
            timestamp: "2026-05-05T00:00:00.000Z",
            color: 0x5865f2,
            footer: {
                text: "footer",
                icon_url: "https://spacebar.chat/icon.png",
            },
            image: {
                url: "https://spacebar.chat/image.png",
                width: 1024,
                height: 512,
            },
            thumbnail: {
                url: "https://spacebar.chat/thumb.png",
                width: 128,
                height: 128,
            },
            provider: {
                name: "Spacebar",
                url: "https://spacebar.chat",
            },
            author: {
                name: "Spacebar",
                url: "https://spacebar.chat",
                icon_url: "https://spacebar.chat/author.png",
            },
            fields,
        })),
        attachments: Array.from({ length: 10 }, (_, index) => ({
            id: String(index),
            filename: `attachment-${index}.txt`,
        })),
        allowed_mentions: {
            parse: ["users", "roles"],
            users: ["100000000000000001", "100000000000000002"],
            roles: ["100000000000000003"],
            replied_user: false,
        },
    });
}

function createProfileSession() {
    const session = new inspector.Session();
    session.connect();

    const post = (method, params) =>
        new Promise((resolve, reject) => {
            session.post(method, params || {}, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

    return {
        async start() {
            await post("Profiler.enable");
            await post("HeapProfiler.enable");
            await post("HeapProfiler.startSampling", { samplingInterval: 32768 });
            await post("Profiler.start");
        },
        async stop() {
            const cpu = await post("Profiler.stop");
            const heap = await post("HeapProfiler.stopSampling");
            session.disconnect();
            return { cpuProfile: cpu.profile, heapProfile: heap.profile };
        },
    };
}

function aggregateCpu(profile, limit = 12) {
    const totals = new Map();

    for (const node of profile.nodes || []) {
        const callFrame = node.callFrame || {};
        const url = normalizeProfileUrl(callFrame.url || "");
        const key = `${callFrame.functionName || "(anonymous)"} ${url}`;
        const previous = totals.get(key) || {
            functionName: callFrame.functionName || "(anonymous)",
            url,
            hitCount: 0,
        };
        previous.hitCount += node.hitCount || 0;
        totals.set(key, previous);
    }

    return Array.from(totals.values())
        .sort((a, b) => b.hitCount - a.hitCount)
        .slice(0, limit);
}

function aggregateHeap(profile, limit = 12) {
    const totals = new Map();

    function visit(node) {
        if (!node) return;
        const callFrame = node.callFrame || {};
        const url = normalizeProfileUrl(callFrame.url || "");
        const key = `${callFrame.functionName || "(anonymous)"} ${url}`;
        const previous = totals.get(key) || {
            functionName: callFrame.functionName || "(anonymous)",
            url,
            selfSize: 0,
        };
        previous.selfSize += node.selfSize || 0;
        totals.set(key, previous);
        for (const child of node.children || []) visit(child);
    }

    visit(profile.head);

    return Array.from(totals.values())
        .sort((a, b) => b.selfSize - a.selfSize)
        .slice(0, limit);
}

function percentile(sortedValues, pct) {
    if (sortedValues.length === 0) return 0;
    const index = Math.min(sortedValues.length - 1, Math.ceil((pct / 100) * sortedValues.length) - 1);
    return sortedValues[index];
}

async function startServer() {
    const app = express();
    app.use(BodyParser({ inflate: true, limit: "10mb" }));
    app.post("/api/v9/bench/message", route({ requestBody: "MessageCreateSchema" }), (_req, res) => res.sendStatus(204));
    app.post("/api/v9/bench/unsafe-integer", route({ requestBody: "MessageCreateSchema" }), (req, res) =>
        res.json({
            nonceType: typeof req.body.nonce,
            nonce: req.body.nonce,
        }),
    );
    app.use(ErrorHandler);

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    return server;
}

function postJson(url, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            url,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(body),
                },
            },
            (res) => {
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        resolve({
                            statusCode: res.statusCode,
                            body: data ? JSON.parse(data) : null,
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            },
        );

        req.on("error", reject);
        req.end(body);
    });
}

async function checkUnsafeIntegerParsing(baseUrl) {
    const unsafeInteger = "900719925474099312345";
    const response = await postJson(`${baseUrl}/api/v9/bench/unsafe-integer`, `{"content":"x","nonce":${unsafeInteger}}`);

    const passed = response.statusCode === 200 && response.body?.nonceType === "string" && response.body?.nonce === unsafeInteger;
    if (!passed) {
        throw new Error(`Unsafe integer parsing check failed: ${JSON.stringify(response)}`);
    }

    return {
        unsafeInteger,
        response: response.body,
    };
}

async function runLoad(url, body, totalRequests) {
    const agent = new http.Agent({ keepAlive: true, maxSockets: concurrency });
    const latencies = [];
    let completed = 0;
    let failed = 0;
    let nextRequest = 0;

    const sendOne = () =>
        new Promise((resolve) => {
            const start = performance.now();
            const req = http.request(
                url,
                {
                    method: "POST",
                    agent,
                    headers: {
                        "content-type": "application/json",
                        "content-length": Buffer.byteLength(body),
                    },
                },
                (res) => {
                    res.resume();
                    res.on("end", () => {
                        latencies.push(performance.now() - start);
                        completed++;
                        if (res.statusCode !== 204) failed++;
                        resolve();
                    });
                },
            );

            req.on("error", () => {
                latencies.push(performance.now() - start);
                completed++;
                failed++;
                resolve();
            });

            req.end(body);
        });

    async function worker() {
        while (nextRequest < totalRequests) {
            nextRequest++;
            await sendOne();
        }
    }

    const start = performance.now();
    await Promise.all(Array.from({ length: concurrency }, worker));
    const durationMs = performance.now() - start;
    agent.destroy();

    latencies.sort((a, b) => a - b);

    return {
        completed,
        failed,
        durationMs,
        requestsPerSecond: completed / (durationMs / 1000),
        latencyMs: {
            p50: percentile(latencies, 50),
            p90: percentile(latencies, 90),
            p99: percentile(latencies, 99),
            max: latencies[latencies.length - 1] || 0,
        },
    };
}

async function main() {
    fs.mkdirSync(outputDir, { recursive: true });
    const server = await startServer();
    const address = server.address();
    const baseUrl = `http://${address.address}:${address.port}`;
    const url = `${baseUrl}/api/v9/bench/message`;
    const body = makePayload();
    const unsafeIntegerCheck = await checkUnsafeIntegerParsing(baseUrl);

    await runLoad(url, body, warmupRequests);

    const profileSession = createProfileSession();
    await profileSession.start();
    const heapBefore = process.memoryUsage();
    const result = await runLoad(url, body, requests);
    const heapAfter = process.memoryUsage();
    const { cpuProfile, heapProfile } = await profileSession.stop();
    normalizeCpuProfile(cpuProfile);
    normalizeHeapProfile(heapProfile);

    await new Promise((resolve) => server.close(resolve));

    const cpuProfilePath = path.join(outputDir, `${label}.cpuprofile`);
    const heapProfilePath = path.join(outputDir, `${label}.heapprofile`);
    const summaryPath = path.join(outputDir, `${label}.summary.json`);
    const cpuProfileFilename = path.basename(cpuProfilePath);
    const heapProfileFilename = path.basename(heapProfilePath);

    fs.writeFileSync(cpuProfilePath, JSON.stringify(cpuProfile));
    fs.writeFileSync(heapProfilePath, JSON.stringify(heapProfile));

    const summary = {
        label,
        benchmark: "route-validation-message-create",
        requests,
        concurrency,
        warmupRequests,
        payload: {
            bytes: Buffer.byteLength(body),
            embeds,
            fieldsPerEmbed,
        },
        unsafeIntegerCheck,
        result,
        heap: {
            before: heapBefore,
            after: heapAfter,
            deltaHeapUsed: heapAfter.heapUsed - heapBefore.heapUsed,
            deltaExternal: heapAfter.external - heapBefore.external,
            deltaArrayBuffers: heapAfter.arrayBuffers - heapBefore.arrayBuffers,
        },
        profiles: {
            cpuProfilePath: cpuProfileFilename,
            heapProfilePath: heapProfileFilename,
            topCpu: aggregateCpu(cpuProfile),
            topHeap: aggregateHeap(heapProfile),
        },
    };

    fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
