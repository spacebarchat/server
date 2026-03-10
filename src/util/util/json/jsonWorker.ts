// @ts-nocheck

import { parentPort } from "worker_threads";

declare const require: any;

let rust: { serialize?: (v: any) => string; deserialize?: (s: string) => any } | null = null;
try {
    rust = require("../../../../native/json-rust/index.js");
} catch (e) {
    rust = null;
}

parentPort?.on("message", async (message: any) => {
    try {
        if (message.type === "serialize") {
            const result = rust && rust.serialize ? rust.serialize(message.value) : JSON.stringify(message.value);
            parentPort?.postMessage({ result });
        } else if (message.type === "deserialize") {
            // rust.deserialize returns a JS object
            if (rust && rust.deserialize) {
                const obj = rust.deserialize(message.json);
                parentPort?.postMessage({ result: JSON.stringify(obj) });
            } else {
                const parsed = JSON.parse(message.json);
                const result = JSON.stringify(parsed);
                parentPort?.postMessage({ result });
            }
        }
    } catch (error) {
        parentPort?.postMessage({ error: (error as Error).message });
    }
});
