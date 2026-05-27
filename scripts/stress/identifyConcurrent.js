/* eslint-env node */

require("dotenv").config({ quiet: true });
const { OPCODES } = require("../../dist/gateway/util/Constants.js");
const WebSocket = require("ws");
const { sleep } = require("../../dist/util/util/extensions/index.js");
const TOKEN = process.env.TOKEN;
const TOTAL_ITERATIONS = process.env.ITER ? parseInt(process.env.ITER) : 500;
const PORT = process.env.PORT ?? 3002;
const ENDPOINT = `ws://localhost:${PORT}?v=9&encoding=json`;
const KEEPALIVE = !!process.env.KEEPALIVE;
const SLEEP_EVERY = process.env.SLEEP_EVERY ? parseInt(process.env.SLEEP_EVERY) : 100;

const doTimedIdentify = () =>
    new Promise((resolve, reject) => {
        let start;
        const ws = new WebSocket(ENDPOINT);
        ws.setMaxListeners(TOTAL_ITERATIONS);
        ws.on("message", (data) => {
            const parsed = JSON.parse(data);
            let heartbeat;

            switch (parsed.op) {
                case OPCODES.Hello:
                    // send identify
                    start = performance.now();
                    ws.send(
                        JSON.stringify({
                            op: OPCODES.Identify,
                            d: {
                                token: TOKEN,
                                properties: {},
                            },
                        }),
                    );

                    if (KEEPALIVE)
                        heartbeat = setInterval(() => {
                            ws.send(
                                JSON.stringify({
                                    op: OPCODES.Heartbeat,
                                    d: null,
                                }),
                            );
                            process.stdout.write(".");
                        }, parsed.d.heartbeat_interval);
                    break;
                case OPCODES.Dispatch:
                    if (parsed.t == "READY") {
                        if (!KEEPALIVE) ws.close();
                        else process.stdout.write("R");
                        return resolve(performance.now() - start);
                    }

                    break;
            }
            ws.on("error", reject);
            if (KEEPALIVE)
                ws.on("close", () => {
                    process.stdout.write("C");
                    clearTimeout(heartbeat);
                });
        });
    });

(async () => {
    const promises = [];
    for (let i = 0; i < TOTAL_ITERATIONS; i++) {
        promises.push(doTimedIdentify());
        process.stdout.write("+");
        // await sleep(Math.random() * 250);
        if (promises.length % SLEEP_EVERY === 0) await Promise.all(promises);
    }

    const perfs = [];
    console.log("Identifies started");
    for (const prom of promises) {
        const ret = await prom;
        perfs.push(ret);
        const avg = perfs.reduce((prev, curr) => prev + curr) / (perfs.length - 1);
        console.log(`${perfs.length}/${promises.length}: Identified in ${Math.floor(ret)}ms - avg: ${Math.floor(avg * 100) / 100}ms`);
    }

    const avg = perfs.reduce((prev, curr) => prev + curr) / (perfs.length - 1);
    console.log(`Average identify time: ${Math.floor(avg * 100) / 100}ms`);
})().catch((e) => console.error("Fail:", e));
