/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, it } from "node:test";

const execFileAsync = promisify(execFile);

const routeHarness = String.raw`
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.DATABASE ??= "postgres://user:pass@localhost:5432/test";
process.env.NODE_ENV = "test";
process.env.NODE_PATH = path.join(process.cwd(), "node_modules");
require("node:module").Module._initPaths();
require("module-alias/register");

const express = require("express");
const { Server } = require("lambert-server");

const message = {
    id: "message",
    toJSON: () => ({ id: "message", content: "original" }),
};
const updatedMessage = {
    id: "message",
    toJSON: () => ({ id: "message", content: "edited" }),
};
let calls = [];
function record(name, ...args) {
    calls.push({ name, args });
}
function callNames() {
    return calls.map((call) => call.name);
}

global.__webhookMessageHelpers = {
    getWebhookForToken: async (...args) => {
        record("getWebhookForToken", ...args);
        return { id: args[0], token: args[1] };
    },
    getWebhookMessage: async (...args) => {
        record("getWebhookMessage", ...args);
        return message;
    },
    buildWebhookMessageEditBody: async (...args) => {
        record("buildWebhookMessageEditBody", ...args);
        return args[1];
    },
    editWebhookMessage: async (...args) => {
        record("editWebhookMessage", ...args);
        return updatedMessage;
    },
    deleteWebhookMessage: async (...args) => {
        record("deleteWebhookMessage", ...args);
    },
};

async function main() {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "spacebar-webhook-route-"));
    const tempRoutesRoot = path.join(tempRoot, "routes");
    const tempRouteDir = path.join(tempRoutesRoot, "webhooks", "#webhook_id", "#token", "messages", "#message_id");
    const tempHelperDir = path.join(tempRoot, "util", "handlers");
    fs.mkdirSync(tempRouteDir, { recursive: true });
    fs.mkdirSync(tempHelperDir, { recursive: true });
    fs.writeFileSync(path.join(tempHelperDir, "WebhookMessage.js"), "module.exports = global.__webhookMessageHelpers;\n");

    const sourceRouteFile = path.join(process.cwd(), "dist/api/routes/webhooks/#webhook_id/#token/messages/#message_id/index.js");
    const sourceRoute = fs.readFileSync(sourceRouteFile, "utf8").replace(/\n\/\/# sourceMappingURL=.*\n?$/, "\n");
    fs.writeFileSync(path.join(tempRouteDir, "index.js"), sourceRoute);

    const app = express();
    app.use(express.json());

    const server = new Server({ app, serverInitLogging: false });
    const routesRoot = tempRoutesRoot;
    const routeFile = path.join(routesRoot, "webhooks", "#webhook_id", "#token", "messages", "#message_id", "index.js");
    assert.ok(server.registerRoute(routesRoot, routeFile), "webhook message route should register");

    const listener = app.listen(0);
    await new Promise((resolve) => listener.once("listening", resolve));
    const baseUrl = "http://127.0.0.1:" + listener.address().port;

    try {
        let response = await fetch(baseUrl + "/webhooks/webhook/token/messages/message?thread_id=thread");
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { id: "message", content: "original" });
        assert.deepEqual(callNames(), ["getWebhookForToken", "getWebhookMessage"]);
        assert.deepEqual(calls[0].args, ["webhook", "token"]);
        assert.deepEqual(calls[1].args, ["webhook", "message", "thread"]);

        calls = [];
        response = await fetch(baseUrl + "/webhooks/webhook/token/messages/message", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ content: "edited" }),
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { id: "message", content: "edited" });
        assert.deepEqual(callNames(), ["getWebhookForToken", "getWebhookMessage", "buildWebhookMessageEditBody", "editWebhookMessage"]);
        assert.equal(calls[2].args[0], message);
        assert.deepEqual({ ...calls[2].args[1] }, { content: "edited" });
        assert.equal(calls[3].args[0], message);
        assert.deepEqual({ ...calls[3].args[1] }, { content: "edited" });

        calls = [];
        const nullableBody = { attachments: null, content: null, embeds: null };
        response = await fetch(baseUrl + "/webhooks/webhook/token/messages/message", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(nullableBody),
        });
        assert.equal(response.status, 200);
        assert.deepEqual(callNames(), ["getWebhookForToken", "getWebhookMessage", "buildWebhookMessageEditBody", "editWebhookMessage"]);
        assert.equal(calls[2].args[0], message);
        assert.deepEqual({ ...calls[2].args[1] }, nullableBody);
        assert.equal(calls[3].args[0], message);
        assert.deepEqual({ ...calls[3].args[1] }, nullableBody);

        calls = [];
        response = await fetch(baseUrl + "/webhooks/webhook/token/messages/message", { method: "DELETE" });
        assert.equal(response.status, 204);
        assert.equal(await response.text(), "");
        assert.deepEqual(callNames(), ["getWebhookForToken", "getWebhookMessage", "deleteWebhookMessage"]);
        assert.deepEqual(calls[0].args, ["webhook", "token"]);
        assert.deepEqual(calls[1].args, ["webhook", "message", undefined]);
        assert.deepEqual(calls[2].args, [message]);
    } finally {
        await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
`;

describe("webhook message route registration", () => {
    it("registers and dispatches GET/PATCH/DELETE webhook message requests", async () => {
        const { NODE_V8_COVERAGE: _nodeV8Coverage, ...env } = process.env;
        const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "spacebar-webhook-route-harness-"));
        const harnessFile = path.join(tempRoot, "route-harness.js");
        fs.writeFileSync(harnessFile, routeHarness);

        try {
            const { stderr, stdout } = await execFileAsync(process.execPath, ["--enable-source-maps", harnessFile], {
                cwd: process.cwd(),
                env: {
                    ...env,
                    DATABASE: process.env.DATABASE ?? "postgres://user:pass@localhost:5432/test",
                },
                timeout: 10_000,
            });

            assert.equal(stdout, "");
            assert.equal(stderr, "");
        } finally {
            fs.rmSync(tempRoot, { recursive: true, force: true });
        }
    });
});
