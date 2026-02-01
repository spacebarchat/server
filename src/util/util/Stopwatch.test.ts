import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Stopwatch, timePromise } from "./Stopwatch";

describe("Stopwatch", () => {
    test("should be able to be initialised", () => {
        const sw = new Stopwatch();
        assert.equal(sw != null, true);
    });

    test("should measure elapsed time", async () => {
        const sw = Stopwatch.startNew();
        await new Promise((resolve) => setTimeout(resolve, 101));
        sw.stop();
        const elapsed = sw.elapsed();
        assert(elapsed.totalMilliseconds >= 100, `Elapsed time was ${elapsed.totalMilliseconds} ms`);
    });

    test("should reset correctly", async () => {
        const sw = Stopwatch.startNew();
        await new Promise((resolve) => setTimeout(resolve, 101));
        sw.stop();
        let elapsed = sw.elapsed();
        assert(elapsed.totalMilliseconds >= 100, `Elapsed time was ${elapsed.totalMilliseconds} ms`);

        sw.reset();
        await new Promise((resolve) => setTimeout(resolve, 50));
        sw.stop();
        elapsed = sw.elapsed();
        assert(elapsed.totalMilliseconds >= 49 && elapsed.totalMilliseconds < 100, `Elapsed time after reset was ${elapsed.totalMilliseconds} ms`);
    });

    test("getElapsedAndReset should work correctly", async () => {
        const sw = Stopwatch.startNew();
        await new Promise((resolve) => setTimeout(resolve, 101));
        sw.stop();
        let elapsed = sw.getElapsedAndReset();
        assert(elapsed.totalMilliseconds >= 100, `Elapsed time was ${elapsed.totalMilliseconds} ms`);

        await new Promise((resolve) => setTimeout(resolve, 50));
        sw.stop();
        elapsed = sw.elapsed();
        assert(elapsed.totalMilliseconds >= 50 && elapsed.totalMilliseconds < 100, `Elapsed time after getElapsedAndReset was ${elapsed.totalMilliseconds} ms`);
    });

    test("timePromise should measure promise execution time", async () => {
        const { result, elapsed } = await timePromise(async () => {
            await new Promise((resolve) => setTimeout(resolve, 101));
            return 42;
        });
        assert.equal(result, 42);
        assert(elapsed.totalMilliseconds >= 100, `Elapsed time was ${elapsed.totalMilliseconds} ms`);
    });
});
