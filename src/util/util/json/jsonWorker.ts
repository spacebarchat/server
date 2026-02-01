import { parentPort } from "worker_threads";

parentPort?.on("message", (message) => {
    try {
        if (message.type === "serialize") {
            const result = JSON.stringify(message.value);
            parentPort?.postMessage({ result });
        } else if (message.type === "deserialize") {
            const parsed = JSON.parse(message.json);
            const result = JSON.stringify(parsed);
            parentPort?.postMessage({ result });
        }
    } catch (error) {
        parentPort?.postMessage({ error: (error as Error).message });
    }
});
