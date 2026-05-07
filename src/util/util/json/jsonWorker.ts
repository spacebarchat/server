import { parentPort } from "node:worker_threads";

parentPort?.on("message", (message) => {
    try {
        if (message.type === "serialize") {
            const result = JSON.stringify(message.value);
            parentPort?.postMessage({ id: message.id, result });
        } else if (message.type === "deserialize") {
            const parsed = JSON.parse(message.json);
            const result = JSON.stringify(parsed);
            parentPort?.postMessage({ id: message.id, result });
        }
    } catch (error) {
        parentPort?.postMessage({ id: message.id, error: (error as Error).message });
    }
});
