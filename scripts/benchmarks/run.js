#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { performance } = require("node:perf_hooks");
const { optionBoolean, optionList, optionNumber, parseArgs } = require("./lib/args");
const { medianMetrics } = require("./lib/stats");
const { profileMeasuredBlock } = require("./lib/profiler");

function repoCommit(repoRoot) {
    try {
        return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
    } catch {
        return null;
    }
}

function timestampLabel(date = new Date()) {
    return date.toISOString().replace(/[:.]/g, "-");
}

function loadSuites(suiteDir) {
    return fs
        .readdirSync(suiteDir)
        .filter((file) => file.endsWith(".js"))
        .sort()
        .map((file) => require(path.join(suiteDir, file)));
}

function validateSuite(suite) {
    if (!suite || typeof suite !== "object") throw new Error("Benchmark suite must export an object");
    if (!suite.name || typeof suite.name !== "string") throw new Error("Benchmark suite is missing stable name");
    if (!suite.metrics || typeof suite.metrics !== "object") throw new Error(`${suite.name} is missing metric declarations`);
    if (typeof suite.setup !== "function") throw new Error(`${suite.name} is missing setup(ctx)`);
    if (typeof suite.run !== "function") throw new Error(`${suite.name} is missing run(ctx)`);
    if (typeof suite.teardown !== "function") throw new Error(`${suite.name} is missing teardown(ctx)`);
}

function summaryTrials(suiteResults) {
    if (suiteResults.length === 1) return suiteResults[0].trials;

    return suiteResults.flatMap((suite) =>
        suite.trials.map((trial) => ({
            ...trial,
            suite: suite.suite,
        })),
    );
}

function summaryMedian(suiteResults) {
    if (suiteResults.length === 1) return suiteResults[0].median;
    return Object.fromEntries(suiteResults.map((suite) => [suite.suite, suite.median]));
}

function summaryMetrics(suiteResults) {
    if (suiteResults.length === 1) return suiteResults[0].metrics;
    return Object.fromEntries(suiteResults.map((suite) => [suite.suite, suite.metrics]));
}

function selectSuites(suites, requested, includeFullstack) {
    const selected = requested.length === 0 || requested.includes("all") ? suites : suites.filter((suite) => requested.includes(suite.name));
    const filtered = selected.filter((suite) => includeFullstack || suite.kind !== "fullstack");
    const missing = requested.filter((name) => name !== "all" && !suites.some((suite) => suite.name === name));

    if (missing.length) throw new Error(`Unknown benchmark suite(s): ${missing.join(", ")}`);
    if (!filtered.length) throw new Error("No benchmark suites selected");
    return filtered;
}

async function runTrial(suite, ctx, iteration, phase) {
    if (global.gc) global.gc();

    const start = performance.now();
    const metrics = await suite.run({ ...ctx, iteration, phase });
    const durationMs = performance.now() - start;

    if (!metrics || typeof metrics !== "object") throw new Error(`${suite.name} trial returned no metrics`);
    for (const [metricId, value] of Object.entries(metrics)) {
        if (!Number.isFinite(value)) throw new Error(`${suite.name} trial returned non-finite metric ${metricId}`);
    }

    return {
        iteration,
        phase,
        durationMs,
        metrics,
    };
}

async function runSuite(suite, baseCtx, options) {
    validateSuite(suite);

    const suiteOutputDir = path.join(baseCtx.outputDir, suite.name);
    fs.mkdirSync(suiteOutputDir, { recursive: true });

    const ctx = {
        ...baseCtx,
        suiteOutputDir,
        suite,
    };

    const profiles = [];
    try {
        await suite.setup(ctx);

        for (let i = 0; i < options.warmup; i += 1) {
            await runTrial(suite, ctx, i + 1, "warmup");
        }

        const measured = async () => {
            const trials = [];
            for (let i = 0; i < options.trials; i += 1) {
                trials.push(await runTrial(suite, ctx, i + 1, "measured"));
            }
            return trials;
        };

        let trials;
        if (options.profile) {
            const cpuProfile = path.join(baseCtx.outputDir, `${suite.name}.cpuprofile`);
            const heapProfile = path.join(baseCtx.outputDir, `${suite.name}.heapprofile`);
            trials = await profileMeasuredBlock({ cpu: cpuProfile, heap: heapProfile }, measured);
            profiles.push({ type: "cpu", path: path.relative(baseCtx.outputDir, cpuProfile) }, { type: "heap", path: path.relative(baseCtx.outputDir, heapProfile) });
        } else {
            trials = await measured();
        }

        return {
            suite: suite.name,
            kind: suite.kind || "pr",
            description: suite.description || "",
            metrics: suite.metrics,
            trials,
            median: medianMetrics(trials),
            profiles,
        };
    } finally {
        await suite.teardown(ctx);
    }
}

async function main() {
    const { options } = parseArgs(process.argv.slice(2));
    const repoRoot = path.resolve(String(options.repoRoot || path.resolve(__dirname, "..", "..")));
    const suiteDir = path.resolve(String(options.suiteDir || path.join(repoRoot, "benchmarks", "suites")));
    require("module-alias")(path.join(repoRoot, "package.json"));

    const includeFullstack = optionBoolean(options, "includeFullstack", false);
    const profile = optionBoolean(options, "profile", false);
    const ci = optionBoolean(options, "ci", false);
    const trials = optionNumber(options, "trials", 3);
    const warmup = optionNumber(options, "warmup", 1);
    const requestedSuites = optionList(options, "suite");
    const outputDir = path.resolve(String(options.output || path.join("benchmarks", "results", ci ? "ci" : timestampLabel())));

    const suites = selectSuites(loadSuites(suiteDir), requestedSuites, includeFullstack);
    const baseCtx = {
        ci,
        includeFullstack,
        options,
        outputDir,
        repoRoot,
    };

    fs.mkdirSync(outputDir, { recursive: true });

    const suiteResults = [];
    for (const suite of suites) {
        process.stdout.write(`Running benchmark suite ${suite.name} (${warmup} warmup, ${trials} measured)\n`);
        suiteResults.push(await runSuite(suite, baseCtx, { profile, trials, warmup }));
    }

    const timestamp = new Date().toISOString();
    const summary = {
        schemaVersion: 1,
        suite: suiteResults.length === 1 ? suiteResults[0].suite : "multiple",
        commit: repoCommit(repoRoot),
        nodeVersion: process.version,
        timestamp,
        trials: summaryTrials(suiteResults),
        median: summaryMedian(suiteResults),
        metrics: summaryMetrics(suiteResults),
        profiles: suiteResults.flatMap((suite) => suite.profiles.map((profileEntry) => ({ ...profileEntry, suite: suite.suite }))),
        suites: suiteResults,
        environment: {
            arch: process.arch,
            ci,
            cpus: os.cpus().length,
            includeFullstack,
            platform: process.platform,
            runnerName: process.env.RUNNER_NAME || null,
            totalMemoryBytes: os.totalmem(),
        },
    };

    fs.writeFileSync(path.join(outputDir, "summary.json"), `${JSON.stringify(summary, null, 4)}\n`);
    process.stdout.write(`Wrote benchmark summary to ${path.join(outputDir, "summary.json")}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error.stack || error.message);
        process.exit(1);
    });
