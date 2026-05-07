"use strict";

function assertNumbers(values, label) {
    if (!Array.isArray(values) || values.length === 0) throw new Error(`${label} requires at least one value`);
    for (const value of values) {
        if (!Number.isFinite(value)) throw new Error(`${label} received a non-finite value: ${value}`);
    }
}

function median(values) {
    assertNumbers(values, "median");
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2) return sorted[mid];
    return (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values, percentileValue) {
    assertNumbers(values, "percentile");
    if (!Number.isFinite(percentileValue) || percentileValue < 0 || percentileValue > 100) {
        throw new Error(`Invalid percentile value: ${percentileValue}`);
    }

    const sorted = [...values].sort((a, b) => a - b);
    const rank = (percentileValue / 100) * (sorted.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);

    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (rank - lower);
}

function medianMetrics(trials) {
    if (!Array.isArray(trials) || trials.length === 0) throw new Error("Cannot calculate median metrics without trials");

    const metricIds = new Set();
    for (const trial of trials) {
        for (const metricId of Object.keys(trial.metrics || {})) {
            metricIds.add(metricId);
        }
    }

    const medians = {};
    for (const metricId of metricIds) {
        medians[metricId] = median(trials.map((trial) => trial.metrics[metricId]));
    }

    return medians;
}

module.exports = {
    median,
    medianMetrics,
    percentile,
};
