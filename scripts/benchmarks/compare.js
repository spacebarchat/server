#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("./lib/args");
const { compareSummaries, loadSummary, loadThresholds } = require("./lib/compare-core");

function usage() {
    return [
        "Usage: npm run bench:compare -- --base <summary-or-dir> --head <summary-or-dir> [--out <dir>] [--thresholds <file>]",
        "",
        "Writes comparison.json and comparison.md. Regressions are warn-only; malformed input exits nonzero.",
    ].join("\n");
}

async function main() {
    const { options } = parseArgs(process.argv.slice(2));

    if (!options.base || !options.head) {
        console.error(usage());
        process.exitCode = 1;
        return;
    }

    const outDir = path.resolve(String(options.out || "benchmarks/results/comparison"));
    const thresholdsPath = options.thresholds ? path.resolve(String(options.thresholds)) : path.resolve("benchmarks/thresholds.json");
    const thresholds = fs.existsSync(thresholdsPath) ? loadThresholds(thresholdsPath) : loadThresholds();
    const comparison = compareSummaries(loadSummary(String(options.base)), loadSummary(String(options.head)), thresholds);

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "comparison.json"), `${JSON.stringify(comparison, null, 4)}\n`);
    fs.writeFileSync(path.join(outDir, "comparison.md"), comparison.markdown);

    process.stdout.write(comparison.markdown);
}

main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
});
