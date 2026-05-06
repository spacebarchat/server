import { JsonSerializerOptions } from "./JsonSerializerOptions";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import os from "node:os";
import { ReadStream, WriteStream } from "node:fs";

type JsonWorkerMessage = {
    id: number;
    result?: string;
    error?: string;
};

type PendingJsonWorkerRequest = {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
    worker: Worker;
};

const DEFAULT_WORKER_COUNT_LIMIT = 8;
const WORKER_TIMEOUT_MS = 60000;
const workerPool: Worker[] = [];
const pendingRequests = new Map<number, PendingJsonWorkerRequest>();
let currentWorkerIndex = 0;
let requestId = 0;

function getJsonWorkerCount() {
    const configuredWorkers = process.env.JSON_WORKERS ? Number.parseInt(process.env.JSON_WORKERS, 10) : undefined;
    if (configuredWorkers !== undefined) return Math.max(1, configuredWorkers);

    return Math.max(1, Math.min(os.availableParallelism?.() ?? os.cpus().length, DEFAULT_WORKER_COUNT_LIMIT));
}

function rejectPendingRequests(worker: Worker, error: Error) {
    for (const [id, request] of pendingRequests) {
        if (request.worker !== worker) continue;

        clearTimeout(request.timeout);
        pendingRequests.delete(id);
        request.reject(error);
    }
}

function initializeWorkerPool() {
    if (workerPool.length) return;

    for (let i = 0; i < getJsonWorkerCount(); i++) {
        const worker = new Worker(join(__dirname, "jsonWorker.js"));
        worker.unref();
        worker.on("message", (msg: JsonWorkerMessage) => {
            const request = pendingRequests.get(msg.id);
            if (!request) return;

            clearTimeout(request.timeout);
            pendingRequests.delete(msg.id);
            if (msg.error) request.reject(new Error(msg.error));
            else request.resolve(msg.result!);
        });
        worker.on("error", (error) => rejectPendingRequests(worker, error instanceof Error ? error : new Error(String(error))));
        worker.on("exit", (code) => {
            if (code !== 0) rejectPendingRequests(worker, new Error(`JSON worker exited with code ${code}`));
        });
        workerPool.push(worker);
    }
}

function getNextWorker(): Worker {
    initializeWorkerPool();
    const worker = workerPool[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % workerPool.length;
    return worker;
}

function runWorkerTask(message: { type: "serialize"; value: unknown } | { type: "deserialize"; json: string }) {
    const id = requestId++;
    const worker = getNextWorker();

    return new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendingRequests.delete(id);
            reject(new Error("Worker timeout"));
        }, WORKER_TIMEOUT_MS);

        pendingRequests.set(id, { resolve, reject, timeout, worker });
        try {
            worker.postMessage({ ...message, id });
        } catch (error) {
            clearTimeout(timeout);
            pendingRequests.delete(id);
            reject(error instanceof Error ? error : new Error(String(error)));
        }
    });
}

// noinspection JSUnusedLocalSymbols - TODO: implement options
export class JsonSerializer {
    public static async ShutdownAsync(): Promise<void> {
        const workers = workerPool.splice(0);
        currentWorkerIndex = 0;

        for (const [id, request] of pendingRequests) {
            clearTimeout(request.timeout);
            pendingRequests.delete(id);
            request.reject(new Error("JSON serializer worker pool is shutting down"));
        }

        await Promise.all(workers.map((worker) => worker.terminate()));
    }

    public static Serialize<T>(value: T, opts?: JsonSerializerOptions): string {
        return JSON.stringify(value);
    }
    public static async SerializeAsync<T>(value: T, opts?: JsonSerializerOptions): Promise<string> {
        return runWorkerTask({ type: "serialize", value });
    }
    public static Deserialize<T>(json: string, opts?: JsonSerializerOptions): T {
        return JSON.parse(json) as T;
    }
    public static async DeserializeAsync<T>(json: string | ReadableStream | ReadStream, opts?: JsonSerializerOptions): Promise<T> {
        if (json instanceof ReadableStream) return this.DeserializeAsyncReadableStream<T>(json, opts);
        if (json instanceof ReadStream) return this.DeserializeAsyncReadStream<T>(json, opts);

        return JSON.parse(await runWorkerTask({ type: "deserialize", json })) as T;
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
