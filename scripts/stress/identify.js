/* eslint-env node */

require("dotenv").config({ quiet: true });
const { OPCODES } = require("../../dist/gateway/util/Constants.js");
const WebSocket = require("ws");
const ENDPOINT = `ws://localhost:3001?v=9&encoding=json`;
const TOKEN = process.env.TOKEN;
const TOTAL_ITERATIONS = process.env.ITER ? parseInt(process.env.ITER) : 500;

const doTimedIdentify = () =>
    new Promise((resolve) => {
        let start;
        const ws = new WebSocket(ENDPOINT);
        ws.on("message", (data) => {
            const parsed = JSON.parse(data);

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
                    break;
                case OPCODES.Dispatch:
                    if (parsed.t == "READY") {
                        ws.close();
                        return resolve(performance.now() - start);
                    }

                    break;
            }
        });
    });

(async () => {
    const perfs = [];
    while (perfs.length < TOTAL_ITERATIONS) {
        const ret = await doTimedIdentify();
        perfs.push(ret);
        // console.log(`${perfs.length}/${TOTAL_ITERATIONS} - this: ${Math.floor(ret)}ms`)
    }

    const avg = perfs.reduce((prev, curr) => prev + curr) / (perfs.length - 1);
    console.log(`Average identify time: ${Math.floor(avg * 100) / 100}ms`);
})();
