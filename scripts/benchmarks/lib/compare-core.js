"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_THRESHOLDS = {
    defaults: {
        higher: 0.15,
        lower: 0.2,
    },
    metrics: {},
};

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        throw new Error(`Failed to read JSON from ${file}: ${error.message}`);
    }
}

function resolveSummaryPath(input) {
    if (!input) throw new Error("Missing summary path");

    const stat = fs.statSync(input);
    if (stat.isDirectory()) return path.join(input, "summary.json");
    return input;
}

function loadSummary(input) {
    return readJson(resolveSummaryPath(input));
}

function loadThresholds(file) {
    if (!file) return DEFAULT_THRESHOLDS;
    return {
        ...DEFAULT_THRESHOLDS,
        ...readJson(file),
    };
}

function asSuiteList(summary, label) {
    if (!summary || typeof summary !== "object") throw new Error(`${label} summary must be an object`);

    const rawSuites = Array.isArray(summary.suites) && summary.suites.length > 0 ? summary.suites : [summary];
    return rawSuites.map((suite) => {
        const suiteName = suite.suite || suite.name;
        if (!suiteName || typeof suiteName !== "string") throw new Error(`${label} summary has a suite without a stable name`);
        if (!suite.median || typeof suite.median !== "object") throw new Error(`${label} ${suiteName} summary is missing median metrics`);

        const metrics = suite.metrics || summary.metrics || {};
        if (!metrics || typeof metrics !== "object" || Object.keys(metrics).length === 0) {
            throw new Error(`${label} ${suiteName} summary is missing metric declarations`);
        }

        return {
            suite: suiteName,
            metrics,
            median: suite.median,
        };
    });
}

function metricThreshold(metricId, metricDefinition, thresholds) {
    const thresholdDefinition = thresholds.metrics?.[metricId] || {};
    const direction = thresholdDefinition.direction || metricDefinition.direction;
    if (direction !== "higher" && direction !== "lower") {
        throw new Error(`Metric ${metricId} must declare direction "higher" or "lower"`);
    }

    const threshold = Number(thresholdDefinition.threshold ?? metricDefinition.regressionThreshold ?? thresholds.defaults?.[direction]);

    if (!Number.isFinite(threshold) || threshold < 0) throw new Error(`Metric ${metricId} has an invalid regression threshold`);

    return { direction, threshold };
}

function assertMetricValue(summaryLabel, suiteName, metricId, value) {
    if (!Number.isFinite(value)) {
        throw new Error(`${summaryLabel} ${suiteName} is missing numeric median metric ${metricId}`);
    }
}

function compareMetric({ baseValue, headValue, direction, threshold }) {
    const deltaPct = baseValue === 0 ? (headValue === 0 ? 0 : Infinity) : (headValue - baseValue) / Math.abs(baseValue);
    const regression = direction === "higher" ? deltaPct <= -threshold : deltaPct >= threshold;

    return {
        deltaPct,
        regression,
    };
}

function formatValue(value, unit) {
    if (!Number.isFinite(value)) return String(value);
    if (unit === "bytes") return `${(value / 1024 / 1024).toFixed(2)} MiB`;
    if (Math.abs(value) >= 100) return value.toFixed(1);
    if (Math.abs(value) >= 10) return value.toFixed(2);
    return value.toFixed(3);
}

function formatDelta(deltaPct) {
    if (!Number.isFinite(deltaPct)) return String(deltaPct);
    const value = deltaPct * 100;
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function renderMarkdown(comparison) {
    const lines = ["## Benchmark Comparison", "", "| Suite | Metric | Base | Head | Delta | Status |", "| --- | --- | ---: | ---: | ---: | --- |"];

    for (const suite of comparison.suites) {
        for (const metric of suite.metrics) {
            lines.push(
                `| ${suite.suite} | ${metric.label} | ${formatValue(metric.base, metric.unit)} | ${formatValue(metric.head, metric.unit)} | ${formatDelta(metric.deltaPct)} | ${metric.status} |`,
            );
        }
    }

    lines.push("");
    lines.push(`Warn-only regressions: ${comparison.regressionCount}. The workflow fails only for benchmark runtime errors or malformed output.`);
    lines.push("");
    lines.push(`Base: \`${comparison.base.commit || "unknown"}\`; head: \`${comparison.head.commit || "unknown"}\`.`);

    return `${lines.join("\n")}\n`;
}

function compareSummaries(baseSummary, headSummary, thresholds = DEFAULT_THRESHOLDS) {
    const baseSuites = asSuiteList(baseSummary, "base");
    const headSuites = new Map(asSuiteList(headSummary, "head").map((suite) => [suite.suite, suite]));
    const suites = [];
    let regressionCount = 0;

    for (const baseSuite of baseSuites) {
        const headSuite = headSuites.get(baseSuite.suite);
        if (!headSuite) throw new Error(`Head summary is missing suite ${baseSuite.suite}`);

        const metrics = [];
        for (const [metricId, metricDefinition] of Object.entries(baseSuite.metrics)) {
            const baseValue = baseSuite.median[metricId];
            const headValue = headSuite.median[metricId];
            assertMetricValue("base", baseSuite.suite, metricId, baseValue);
            assertMetricValue("head", headSuite.suite, metricId, headValue);

            const threshold = metricThreshold(metricId, metricDefinition, thresholds);
            const result = compareMetric({ baseValue, headValue, ...threshold });
            const status = result.regression ? "warn" : "ok";
            if (result.regression) regressionCount += 1;

            metrics.push({
                metric: metricId,
                label: metricDefinition.label || metricId,
                unit: metricDefinition.unit || "",
                direction: threshold.direction,
                threshold: threshold.threshold,
                base: baseValue,
                head: headValue,
                deltaPct: result.deltaPct,
                status,
            });
        }

        suites.push({
            suite: baseSuite.suite,
            metrics,
        });
    }

    const comparison = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        base: {
            commit: baseSummary.commit || null,
            nodeVersion: baseSummary.nodeVersion || null,
        },
        head: {
            commit: headSummary.commit || null,
            nodeVersion: headSummary.nodeVersion || null,
        },
        regressionCount,
        suites,
    };

    comparison.markdown = renderMarkdown(comparison);
    return comparison;
}

module.exports = {
    compareSummaries,
    loadSummary,
    loadThresholds,
    renderMarkdown,
};
