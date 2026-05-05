"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { compareSummaries, loadSummary, loadThresholds } = require("./lib/compare-core");

const fixtures = path.join(__dirname, "fixtures");
const thresholds = loadThresholds(path.join(__dirname, "..", "..", "benchmarks", "thresholds.json"));

function fixture(caseName, side) {
    return loadSummary(path.join(fixtures, caseName, `${side}.json`));
}

test("compare reports no regressions for stable metrics", () => {
    const comparison = compareSummaries(fixture("no-regression", "base"), fixture("no-regression", "head"), thresholds);

    assert.equal(comparison.regressionCount, 0);
    assert.match(comparison.markdown, /Benchmark Comparison/);
});

test("compare warns on throughput regressions without throwing", () => {
    const comparison = compareSummaries(fixture("throughput-regression", "base"), fixture("throughput-regression", "head"), thresholds);

    assert.equal(comparison.regressionCount, 1);
    assert.equal(comparison.suites[0].metrics.find((metric) => metric.metric === "requestsPerSecond").status, "warn");
});

test("compare warns on latency regressions without throwing", () => {
    const comparison = compareSummaries(fixture("latency-regression", "base"), fixture("latency-regression", "head"), thresholds);

    assert.equal(comparison.regressionCount, 1);
    assert.equal(comparison.suites[0].metrics.find((metric) => metric.metric === "p95LatencyMs").status, "warn");
});

test("compare rejects malformed summaries with missing metrics", () => {
    assert.throws(() => compareSummaries(fixture("malformed", "base"), fixture("malformed", "head"), thresholds), /missing numeric median metric p95LatencyMs/);
});
