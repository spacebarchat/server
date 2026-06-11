import { isMainThread, parentPort, Worker } from "node:worker_threads";
import { ProcessLifecycle } from "../../ProcessLifecycle";
import { Stopwatch } from "../../Stopwatch";
import bcrypt from "bcrypt";

export class BcryptWorkerPool {
    private static _workers: BcryptWorker[] = [];
    private static _idx: number = 0;

    public static async Init(count: number = 2) {
        for (let i = 0; i < count; i++) {
            const sw = Stopwatch.startNew();
            const w = new BcryptWorker();
            await w.Init();
            this._workers.push(w);
            console.log("[BcryptWorkerPool] Started worker", i, "of", count, "in", sw.elapsed().toString());
        }

        ProcessLifecycle.eventEmitter.on("stopped", async () => {
            for (const woKey of this._workers) {
                await woKey.terminate();
                console.log("[BcryptWorkerPool] Terminated worker", this._workers.indexOf(woKey), "of", this._workers.length);
            }
        });
    }

    public static GetBcryptWorker() {
        return this._workers[this._idx++ % this._workers.length];
    }
}

class BcryptWorker {
    public worker: Worker;

    public async Init() {
        this.worker = await new Promise((res, rej) => {
            const w = new Worker(__filename, {});

            w.once("online", () => {
                console.log("[BcryptWorker] Worker", w.threadId, "is online!");
                res(w);
            });
            w.on("error", rej);
            w.on("exit", (exitCode) => console.log("[BcryptWorker] Worker", w.threadId, "exited with code", exitCode));
        });
    }

    public async terminate() {
        await this.worker.terminate();
    }

    public async hashPassword(password: string, rounds: number): Promise<string> {
        const requestId = Math.random().toString(36).substring(2);

        return new Promise((res) => {
            const sw = Stopwatch.startNew();
            const handler = (msg: BcryptWorkerMessage) => {
                if (msg.type == "hash" && msg.requestId === requestId) {
                    res((msg as BcryptHashMessage).password);
                    this.worker.off("message", handler);
                    if (sw.elapsed().totalMilliseconds > 5000) console.log("[BcryptWorker] Got slow response to hashPassword in", sw.elapsed().toString());
                }
            };
            this.worker.on("message", handler);
            this.worker.postMessage({ type: "hash", password, rounds, requestId });
        });
    }
}

interface BcryptWorkerMessage {
    type: "hash" | "verify";
    requestId: string;
}

interface BcryptHashMessage extends BcryptWorkerMessage {
    type: "hash";
    password: string;
    rounds: number;
}

interface BcryptHashVerify extends BcryptWorkerMessage {
    type: "verify";
    password: string;
}

//region Worker implementation
if (!isMainThread) {
    parentPort!.on("message", async (msg: BcryptWorkerMessage) => {
        // console.log("[BcryptWorker] Received", msg.type, "message");
        switch (msg.type) {
            case "hash":
                parentPort?.postMessage({
                    type: "hash",
                    requestId: msg.requestId,
                    rounds: (<BcryptHashMessage>msg).rounds,
                    password: await bcrypt.hash((<BcryptHashMessage>msg).password, (<BcryptHashMessage>msg).rounds),
                } satisfies BcryptHashMessage);
                break;
            case "verify":
                parentPort?.postMessage({
                    type: "hash",
                    requestId: msg.requestId,
                    rounds: (<BcryptHashMessage>msg).rounds,
                    password: await bcrypt.hash((<BcryptHashMessage>msg).password, (<BcryptHashMessage>msg).rounds),
                } satisfies BcryptHashMessage);
                break;
            default:
                console.error("[BcryptWorker] Unknown message type:", msg.type);
        }
    });
}

//endregion
