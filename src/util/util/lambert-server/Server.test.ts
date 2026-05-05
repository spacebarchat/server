import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AddressInfo } from "node:net";
import { Server } from "./Server";

describe("Server.registerRoute", () => {
    test("registers percent-encoded aliases for literal @ route segments", async (t) => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), "spacebar-routes-"));
        const routeFile = path.join(root, "users", "@me", "index.js");
        await fs.mkdir(path.dirname(routeFile), { recursive: true });
        await fs.writeFile(
            routeFile,
            [
                `const express = require(${JSON.stringify(require.resolve("express"))});`,
                "const router = express.Router();",
                'router.get("/", (_req, res) => res.json({ route: "me" }));',
                "module.exports = router;",
            ].join("\n"),
        );

        const server = new Server({ serverInitLogging: false });
        server.registerRoute(root, routeFile);

        const listener = server.app.listen(0);
        t.after(async () => {
            await new Promise<void>((resolve, reject) => {
                listener.close((error) => (error ? reject(error) : resolve()));
            });
            await fs.rm(root, { recursive: true, force: true });
        });

        const { port } = listener.address() as AddressInfo;
        for (const route of ["/users/@me", "/users/%40me"]) {
            const response = await fetch(`http://127.0.0.1:${port}${route}`);
            assert.equal(response.status, 200);
            assert.deepEqual(await response.json(), { route: "me" });
        }
    });
});
