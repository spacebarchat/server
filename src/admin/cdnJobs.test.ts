import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    CdnAttachmentJobDependencies,
    CdnAttachmentJobResult,
    CdnAttachmentRow,
    parseCdnAttachmentJobInput,
    runCdnAttachmentFsckJob,
    runCdnAttachmentMigrationJob,
} from "./cdnJobs";
import { AdminJobContext, AdminJobSnapshot } from "./jobs";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

function createContext(): AdminJobContext<CdnAttachmentJobResult> & { errors: string[] } {
    const errors: string[] = [];
    const job: AdminJobSnapshot<unknown, CdnAttachmentJobResult> = {
        id: "job",
        type: "test",
        status: "running",
        input: {},
        result: null,
        progress: { current: 0, total: null, label: null },
        errors,
        cancelRequested: false,
        idempotencyKey: null,
        createdBy: "operator",
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
        startedAt: new Date(0).toISOString(),
        completedAt: null,
    };

    return {
        errors,
        job,
        setProgress(progress) {
            job.progress = { ...job.progress, ...progress };
        },
        addError(error) {
            errors.push(error instanceof Error ? error.message : String(error));
        },
        throwIfCancellationRequested() {
            if (job.cancelRequested) throw new Error("cancelled");
        },
    };
}

function dependencies(rows: CdnAttachmentRow[], existing: string[] = []): CdnAttachmentJobDependencies & { moved: Array<[string, string]>; markers: string[] } {
    const files = new Set(existing);
    const moved: Array<[string, string]> = [];
    const markers: string[] = [];

    return {
        moved,
        markers,
        storage: {
            async exists(path) {
                return files.has(path);
            },
            async move(path, newPath) {
                moved.push([path, newPath]);
                files.delete(path);
                files.add(newPath);
            },
            async set(path) {
                markers.push(path);
                files.add(path);
            },
        },
        async countRows() {
            return rows.length;
        },
        async streamRows() {
            async function* stream() {
                yield* rows;
            }

            return stream();
        },
    };
}

describe("admin CDN jobs", () => {
    test("parses bounded attachment job input", () => {
        assert.deepEqual(parseCdnAttachmentJobInput({ dry_run: true, force: "true", missing_limit: 9999 }), {
            dryRun: true,
            force: true,
            missingLimit: 500,
        });
    });

    test("fsck reports missing current attachment paths", async () => {
        const deps = dependencies(
            [
                { id: "a1", channelId: "c1", messageId: "m1", filename: "ok.png" },
                { id: "a2", channelId: "c1", messageId: "m2", filename: "missing.png" },
            ],
            ["attachments/c1/m1/ok.png"],
        );
        const context = createContext();

        const result = await runCdnAttachmentFsckJob({ dryRun: false, force: false, missingLimit: 10 }, context, deps);

        assert.equal(result.checked, 2);
        assert.equal(result.present, 1);
        assert.equal(result.missing, 1);
        assert.deepEqual(result.missingPaths, ["attachments/c1/m2/missing.png"]);
        assert.equal(context.errors[0], "Missing CDN attachment file: attachments/c1/m2/missing.png");
    });

    test("migration moves legacy attachment paths and writes the completion marker", async () => {
        const deps = dependencies(
            [
                { id: "a1", channelId: "c1", messageId: "m1", filename: "file.png" },
                { id: "a2", channelId: "c1", messageId: "m2", filename: "current.png" },
            ],
            ["attachments/c1/a1/file.png", "attachments/c1/m2/current.png"],
        );
        const context = createContext();

        const result = await runCdnAttachmentMigrationJob({ dryRun: false, force: false, missingLimit: 10 }, context, deps);

        assert.equal(result.checked, 2);
        assert.equal(result.migrated, 1);
        assert.equal(result.alreadyCurrent, 1);
        assert.deepEqual(deps.moved, [["attachments/c1/a1/file.png", "attachments/c1/m1/file.png"]]);
        assert.deepEqual(deps.markers, [".mig_complete.attachments1"]);
    });
});
