import { JsonSerializerOptions } from "./JsonSerializerOptions";
import { Worker } from "worker_threads";
import { join } from "path";
import os from "os";
import Stream from "node:stream";
import { ReadStream, WriteStream } from "node:fs";

// const worker = new Worker(join(process.cwd(), 'dist', 'util', 'util', 'json', 'jsonWorker.js'));
const workerPool: Worker[] = [];
const numWorkers = process.env.JSON_WORKERS ? parseInt(process.env.JSON_WORKERS) : os.cpus().length;

for (let i = 0; i < numWorkers; i++) {
    console.log("[JsonSerializer] Starting JSON worker", i);
    workerPool.push(new Worker(join(__dirname, "jsonWorker.js")));
    workerPool[i].unref();
    workerPool[i].setMaxListeners(64);
}
let currentWorkerIndex = 0;

function getNextWorker(): Worker {
    const worker = workerPool[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % numWorkers;
    return worker;
}

export class JsonSerializer {
    public static Serialize<T>(value: T, opts?: JsonSerializerOptions): string {
        return JSON.stringify(value);
    }
    public static async SerializeAsync<T>(value: T, opts?: JsonSerializerOptions): Promise<string> {
        const worker = getNextWorker();
        worker.postMessage({ type: "serialize", value });
        return new Promise((resolve, reject) => {
            const handler = (msg: { result?: string; error?: string }) => {
                clearTimeout(timeout);
                worker.removeListener("message", handler);
                if (msg.error) {
                    reject(new Error(msg.error));
                } else {
                    resolve(msg.result!);
                }
            };
            worker.on("message", handler);
            const timeout = setTimeout(() => {
                worker.removeListener("message", handler);
                reject(new Error("Worker timeout"));
            }, 60000);
        });
    }
    public static Deserialize<T>(json: string, opts?: JsonSerializerOptions): T {
        return JSON.parse(json) as T;
    }
    public static async DeserializeAsync<T>(json: string | ReadableStream | ReadStream, opts?: JsonSerializerOptions): Promise<T> {
        if (json instanceof ReadableStream) return this.DeserializeAsyncReadableStream<T>(json, opts);
        if (json instanceof ReadStream) return this.DeserializeAsyncReadStream<T>(json, opts);

        const worker = getNextWorker();
        worker.postMessage({ type: "deserialize", json });
        return new Promise((resolve, reject) => {
            const handler = (msg: { result?: string; error?: string }) => {
                clearTimeout(timeout);
                worker.removeListener("message", handler);
                if (msg.error) {
                    reject(new Error(msg.error));
                } else {
                    resolve(JSON.parse(msg.result!) as T);
                }
            };
            worker.on("message", handler);
            const timeout = setTimeout(() => {
                worker.removeListener("message", handler);
                reject(new Error("Worker timeout"));
            }, 60000);
        });
    }

    private static async DeserializeAsyncReadableStream<T>(jsonStream: ReadableStream, opts?: JsonSerializerOptions): Promise<T> {
        const reader = jsonStream.getReader();
        let jsonData = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            jsonData += new TextDecoder().decode(value);
        }
        return this.DeserializeAsync<T>(jsonData, opts);
    }

    private static async DeserializeAsyncReadStream<T>(jsonStream: ReadStream, opts?: JsonSerializerOptions): Promise<T> {
        let jsonData = "";
        for await (const chunk of jsonStream) {
            jsonData += chunk.toString();
        }
        return this.DeserializeAsync<T>(jsonData, opts);
    }

    public static async *DeserializeAsyncEnumerable<T>(json: string | ReadStream | ReadableStream, opts?: JsonSerializerOptions): AsyncGenerator<T, void, unknown> {
        if (json instanceof ReadableStream) return yield* this.DeserializeAsyncEnumerableReadableStream<T>(json, opts);
        if (json instanceof ReadStream) return yield* this.DeserializeAsyncEnumerableReadStream<T>(json, opts);

        const arr = await this.DeserializeAsync<T[]>(json, opts);
        for (const item of arr) {
            yield item;
        }
    }

    private static async *DeserializeAsyncEnumerableReadableStream<T>(json: ReadableStream, opts?: JsonSerializerOptions) {
        const reader = json.getReader();
        //TODO: implement
        yield undefined as unknown as T;
    }

    private static async *DeserializeAsyncEnumerableReadStream<T>(json: ReadStream, opts?: JsonSerializerOptions) {
        // TODO: implement
        yield undefined as unknown as T;
    }

    public static async SerializeAsyncEnumerableToStringAsync<T>(items: AsyncIterable<T>, opts?: JsonSerializerOptions): Promise<string> {
        let jsonData = "[";
        let first = true;
        for await (const item of items) {
            if (!first) {
                jsonData += ",";
            } else {
                first = false;
            }
            jsonData += await this.SerializeAsync(item, opts);
        }
        jsonData += "]";
        return jsonData;
    }

    public static async SerializeAsyncEnumerableAsync<T>(items: AsyncIterable<T>, stream: WriteStream | WritableStream, opts?: JsonSerializerOptions): Promise<void> {}

    private static async SerializeAsyncEnumerableToWritableStreamAsync<T>(items: AsyncIterable<T>, stream: WritableStream, opts?: JsonSerializerOptions): Promise<void> {
        const writer = stream.getWriter();
        let first = true;
        await writer.write(new TextEncoder().encode("["));
        for await (const item of items) {
            if (!first) {
                await writer.write(new TextEncoder().encode(","));
            } else {
                first = false;
            }
            const jsonItem = await this.SerializeAsync(item, opts);
            await writer.write(new TextEncoder().encode(jsonItem));
        }
        await writer.write(new TextEncoder().encode("]"));
        await writer.close();
    }

    private static async SerializeAsyncEnumerableToWriteStreamAsync<T>(items: AsyncIterable<T>, stream: WriteStream, opts?: JsonSerializerOptions): Promise<void> {
        let first = true;
        stream.write("[");
        for await (const item of items) {
            if (!first) {
                stream.write(",");
            } else {
                first = false;
            }
            const jsonItem = await this.SerializeAsync(item, opts);
            stream.write(jsonItem);
        }
        stream.write("]");
        stream.end();
    }
}
