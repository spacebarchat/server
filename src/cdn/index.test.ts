import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const readSourceFile = (file: string) => readFile(path.join(process.cwd(), "src", "cdn", file), "utf8");
const exportFromRegex = /^\s*export\s+(?:\*|\{[^}]+\})\s+from\s+"([^"]+)";/gm;

describe("CDN public exports", () => {
    test("only exposes public modules from the top-level barrel", async () => {
        assert.deepEqual(await getExportedModules("index.ts"), ["./Server", "./util/Storage", "./util/multer"]);
    });

    test("only exposes public modules from the util barrel", async () => {
        assert.deepEqual(await getExportedModules(path.join("util", "index.ts")), ["./Storage", "./multer"]);
    });
});

const getExportedModules = async (file: string) => {
    const source = await readSourceFile(file);
    return [...source.matchAll(exportFromRegex)].map((match) => match[1]).sort();
};
