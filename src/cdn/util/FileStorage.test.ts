import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { FileStorage } from "./FileStorage";

async function withStorageRoot(test: (root: string, storage: FileStorage) => Promise<void>) {
    const oldStorageLocation = process.env.STORAGE_LOCATION;
    const root = await fsp.mkdtemp(join(tmpdir(), "spacebar-file-storage-"));
    process.env.STORAGE_LOCATION = root;

    try {
        await test(root, new FileStorage());
    } finally {
        if (oldStorageLocation === undefined) delete process.env.STORAGE_LOCATION;
        else process.env.STORAGE_LOCATION = oldStorageLocation;

        await fsp.rm(root, { recursive: true, force: true });
    }
}

describe("FileStorage", () => {
    it("deletes empty parent directories under the storage root", async () => {
        await withStorageRoot(async (root, storage) => {
            const filePath = join(root, "attachments", "channel", "message", "file.txt");
            await fsp.mkdir(join(root, "attachments", "channel", "message"), { recursive: true });
            await fsp.writeFile(filePath, "data");

            await storage.delete("attachments/channel/message/file.txt");

            assert.equal(existsSync(filePath), false);
            assert.equal(existsSync(join(root, "attachments")), false);
            assert.equal(existsSync(root), true);
        });
    });

    it("keeps non-empty parent directories", async () => {
        await withStorageRoot(async (root, storage) => {
            const directory = join(root, "attachments", "channel", "message");
            await fsp.mkdir(directory, { recursive: true });
            await fsp.writeFile(join(directory, "deleted.txt"), "data");
            await fsp.writeFile(join(directory, "kept.txt"), "data");

            await storage.delete("attachments/channel/message/deleted.txt");

            assert.equal(existsSync(join(directory, "deleted.txt")), false);
            assert.equal(existsSync(join(directory, "kept.txt")), true);
            assert.equal(existsSync(directory), true);
        });
    });

    it("removes empty leaf directories while keeping non-empty ancestors", async () => {
        await withStorageRoot(async (root, storage) => {
            const directory = join(root, "attachments", "channel", "message");
            await fsp.mkdir(directory, { recursive: true });
            await fsp.writeFile(join(directory, "deleted.txt"), "data");
            await fsp.writeFile(join(root, "attachments", "channel", "kept.txt"), "data");

            await storage.delete("attachments/channel/message/deleted.txt");

            assert.equal(existsSync(join(directory, "deleted.txt")), false);
            assert.equal(existsSync(directory), false);
            assert.equal(existsSync(join(root, "attachments", "channel", "kept.txt")), true);
            assert.equal(existsSync(join(root, "attachments", "channel")), true);
        });
    });

    it("does not delete the storage root", async () => {
        await withStorageRoot(async (root, storage) => {
            await fsp.writeFile(join(root, "file.txt"), "data");

            await storage.delete("file.txt");

            assert.equal(existsSync(join(root, "file.txt")), false);
            assert.equal(existsSync(root), true);
        });
    });

    it("allows storage paths whose segment merely starts with dot-dot", async () => {
        await withStorageRoot(async (root, storage) => {
            const filePath = join(root, "..not-traversal", "file.txt");
            await fsp.mkdir(join(root, "..not-traversal"), { recursive: true });
            await fsp.writeFile(filePath, "data");

            assert.equal(storage.getFsPath("..not-traversal/file.txt"), filePath);

            await storage.delete("..not-traversal/file.txt");

            assert.equal(existsSync(filePath), false);
            assert.equal(existsSync(root), true);
        });
    });

    it("rejects paths outside the storage root", async () => {
        await withStorageRoot(async (_root, storage) => {
            assert.throws(() => storage.getFsPath("../outside.txt"), /invalid path/);
        });
    });
});
