import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { clearAdminJobsForTests, createAdminJob, getAdminJob, listAdminJobs, requestAdminJobCancellation } from "./jobs";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

function tick() {
    return new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
}

describe("admin jobs", () => {
    test("runs jobs and exposes progress/result snapshots", async () => {
        clearAdminJobsForTests();

        const created = createAdminJob({
            type: "test.job",
            input: { id: "1" },
            createdBy: "operator",
            runner: async (context) => {
                context.setProgress({ current: 1, total: 2, label: "half" });
                return { ok: true };
            },
        });

        assert.equal(created.status, "queued");

        await tick();
        await tick();

        const completed = getAdminJob(created.id);
        assert.equal(completed.status, "succeeded");
        assert.deepEqual(completed.result, { ok: true });
        assert.deepEqual(completed.progress, { current: 1, total: 2, label: "half" });
    });

    test("deduplicates starts with the same type and idempotency key", () => {
        clearAdminJobsForTests();

        const first = createAdminJob({
            type: "test.idempotent",
            input: { id: "1" },
            createdBy: "operator",
            idempotencyKey: "same",
            runner: async () => ({ first: true }),
        });
        const second = createAdminJob({
            type: "test.idempotent",
            input: { id: "2" },
            createdBy: "operator",
            idempotencyKey: "same",
            runner: async () => ({ second: true }),
        });

        assert.equal(second.id, first.id);
        assert.deepEqual(second.input, { id: "1" });
    });

    test("supports cancellation before queued jobs start", async () => {
        clearAdminJobsForTests();

        const created = createAdminJob({
            type: "test.cancel",
            input: {},
            createdBy: "operator",
            runner: async () => ({ shouldNotRun: true }),
        });

        const cancelling = requestAdminJobCancellation(created.id);
        assert.equal(cancelling.cancelRequested, true);

        await tick();
        await tick();

        assert.equal(getAdminJob(created.id).status, "cancelled");
    });

    test("lists jobs with pagination and search metadata", () => {
        clearAdminJobsForTests();

        createAdminJob({
            type: "alpha.cleanup",
            input: {},
            createdBy: "operator-one",
            runner: async () => ({}),
        });
        createAdminJob({
            type: "beta.cleanup",
            input: {},
            createdBy: "operator-two",
            runner: async () => ({}),
        });

        const firstPage = listAdminJobs({ limit: 1, offset: 0 });
        assert.equal(firstPage.items.length, 1);
        assert.equal(firstPage.pagination.total, 2);
        assert.equal(firstPage.pagination.limit, 1);
        assert.equal(firstPage.pagination.offset, 0);

        const filtered = listAdminJobs({ limit: 10, offset: 0, q: "beta" });
        assert.equal(filtered.pagination.total, 1);
        assert.equal(filtered.items[0].type, "beta.cleanup");
    });
});
