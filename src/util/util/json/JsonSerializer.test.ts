import { JsonSerializer } from "./JsonSerializer";
import { after, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import { Stopwatch } from "../Stopwatch";
import { JsonValue } from "@protobuf-ts/runtime";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

describe("JsonSerializer", () => {
    after(async () => {
        await JsonSerializer.ShutdownAsync();
    });

    it("should serialize synchronously", () => {
        const obj = { a: 1, b: "test" };
        const result = JsonSerializer.Serialize(obj);
        assert.equal(result, '{"a":1,"b":"test"}');
    });

    it("should deserialize synchronously", () => {
        const json = '{"a":1,"b":"test"}';
        const result = JsonSerializer.Deserialize(json);
        assert.deepEqual(result, { a: 1, b: "test" });
    });

    it("should serialize asynchronously", async () => {
        const obj = { a: 1, b: "test" };
        const result = await JsonSerializer.SerializeAsync(obj);
        assert.equal(result, '{"a":1,"b":"test"}');
    });

    it("should deserialize asynchronously", async () => {
        const json = '{"a":1,"b":"test"}';
        const result = await JsonSerializer.DeserializeAsync(json);
        assert.deepEqual(result, { a: 1, b: "test" });
    });

    it("should keep concurrent worker responses matched to their requests", async () => {
        const values = Array.from({ length: 64 }, (_, index) => ({ index, payload: `value-${index}` }));
        const results = await Promise.all(values.map((value) => JsonSerializer.DeserializeAsync<typeof value>(JSON.stringify(value))));

        assert.deepEqual(results, values);
    });

    it("should not emit listener leak warnings with many workers", async () => {
        const script = `
            process.on("warning", (warning) => {
                if (warning.name === "MaxListenersExceededWarning") {
                    console.error(warning.stack || warning.message);
                    process.exitCode = 2;
                }
            });

            const { JsonSerializer } = require("./dist/util/util/json/JsonSerializer.js");
            Promise.all(Array.from({ length: 64 }, (_, index) => JsonSerializer.DeserializeAsync(JSON.stringify({ index })))).then(async (results) => {
                if (results.some((result, index) => result.index !== index)) process.exitCode = 3;
                await JsonSerializer.ShutdownAsync();
            }).catch((error) => {
                console.error(error);
                process.exit(4);
            });
        `;

        const { stderr } = await execFileAsync(process.execPath, ["-e", script], {
            cwd: process.cwd(),
            env: { ...process.env, JSON_WORKERS: "20" },
        });

        assert.doesNotMatch(stderr, /MaxListenersExceededWarning/);
    });

    it("should be able to read large file", async () => {
        // write a massive json file
        const sw = Stopwatch.startNew();
        const jsonfile = await fs.open("large.json", "w");
        await jsonfile.write("[");
        const getLargeObj = (index: number, depth: number) => {
            const obj: JsonValue = {};

            if (depth === 0) {
                return obj;
            }
            for (let i = 0; i < 10; i++) {
                obj[`key${i}`] = getLargeObj(index * 10 + i, depth - 1);
            }
            return obj;
        };
        for (let i = 0; i < 100; i++) {
            const entry = JSON.stringify(getLargeObj(i, 5));
            await jsonfile.write(entry);
            if (i < 99) {
                await jsonfile.write(",");
            }
        }
        await jsonfile.write("]");
        await jsonfile.close();
        process.stdout.write("Large file written in " + sw.elapsed().toString() + "\n");

        const jsonData = await fs.readFile("large.json", "utf-8");

        const start = process.hrtime.bigint();
        const obj = await JsonSerializer.DeserializeAsync<{ key: string; value: string }[]>(jsonData);
        const end = process.hrtime.bigint();
        const duration = end - start;
        console.log(`Deserialization took ${duration / BigInt(1e6)} ms`);

        assert.equal(obj.length, 100);
        await fs.unlink("large.json");
    });

    it("should be able to parallelise", async () => {
        // write a massive json file
        const sw = Stopwatch.startNew();
        const jsonfile = await fs.open("large.json", "w");
        await jsonfile.write("[");
        const getLargeObj = (index: number, depth: number) => {
            const obj: JsonValue = {};

            if (depth === 0) {
                return obj;
            }
            for (let i = 0; i < 5; i++) {
                obj[`key${i}`] = getLargeObj(index * 10 + i, depth - 1);
            }
            return obj;
        };
        for (let i = 0; i < 50; i++) {
            const entry = JSON.stringify(getLargeObj(i, 5));
            await jsonfile.write(entry);
            if (i < 49) {
                await jsonfile.write(",");
            }
        }
        await jsonfile.write("]");
        await jsonfile.close();
        process.stdout.write("Large file written in " + sw.elapsed().toString() + "\n");

        const tasks = [];
        const start = process.hrtime.bigint();
        for (let i = 0; i < 64; i++) {
            tasks.push(
                (async () => {
                    const jsonData = await fs.readFile("large.json", "utf-8");

                    const obj = await JsonSerializer.DeserializeAsync<{ key: string; value: string }[]>(jsonData);
                    const end = process.hrtime.bigint();
                    const duration = end - start;
                    console.log(`Deserialization took ${duration / BigInt(1e6)} ms`);

                    assert.equal(obj.length, 50);
                })(),
            );
        }
        await Promise.all(tasks);
        await fs.unlink("large.json");
    });

    // TODO: broken
    // it("should be able to stream large file", async () => {
    //     // write a massive json file
    //     const sw = Stopwatch.startNew();
    //     const jsonfile = await fs.open("large.json", "w");
    //     await jsonfile.write("[");
    //     const getLargeObj = (index: number, depth: number) => {
    //         const obj: JsonValue = {};
    //
    //         if (depth === 0) {
    //             return obj;
    //         }
    //         for (let i = 0; i < 10; i++) {
    //             obj[`key${i}`] = getLargeObj(index * 10 + i, depth - 1);
    //         }
    //         return obj;
    //     };
    //     for (let i = 0; i < 100; i++) {
    //         const entry = JSON.stringify(getLargeObj(i, 5));
    //         await jsonfile.write(entry);
    //         if (i < 99) {
    //             await jsonfile.write(",");
    //         }
    //     }
    //     await jsonfile.write("]");
    //     await jsonfile.close();
    //     process.stdout.write("Large file written in " + sw.elapsed().toString() + "\n");
    //
    //     const jsonData = await fs.open("large.json", "r").then((f) => f.createReadStream());
    //
    //     const start = process.hrtime.bigint();
    //     const obj = await JsonSerializer.DeserializeAsync<{ key: string; value: string }[]>(jsonData);
    //     const end = process.hrtime.bigint();
    //     const duration = end - start;
    //     console.log(`Deserialization took ${duration / BigInt(1e6)} ms`);
    //
    //     assert.equal(obj.length, 100);
    //     await fs.unlink("large.json");
    // });
});
