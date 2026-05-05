"use strict";

const fs = require("node:fs/promises");
const inspector = require("node:inspector");

function post(session, method, params) {
    return new Promise((resolve, reject) => {
        session.post(method, params || {}, (error, result) => {
            if (error) reject(error);
            else resolve(result || {});
        });
    });
}

async function profileMeasuredBlock(paths, fn) {
    const session = new inspector.Session();
    session.connect();

    try {
        await post(session, "Profiler.enable");
        await post(session, "HeapProfiler.enable");
        await post(session, "HeapProfiler.startSampling", { samplingInterval: 32768 });
        await post(session, "Profiler.start");

        const result = await fn();

        const cpu = await post(session, "Profiler.stop");
        const heap = await post(session, "HeapProfiler.stopSampling");

        await fs.writeFile(paths.cpu, JSON.stringify(cpu.profile));
        await fs.writeFile(paths.heap, JSON.stringify(heap.profile));

        return result;
    } finally {
        session.disconnect();
    }
}

module.exports = {
    profileMeasuredBlock,
};
