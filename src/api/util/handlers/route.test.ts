import assert from "node:assert/strict";
import http from "node:http";
import { describe, test } from "node:test";
import express from "express";
import { BigNumber } from "bignumber.js";
import { BodyParser, ErrorHandler } from "../../middlewares";
import { bigNumberToString, route } from "./route";

async function startRouteServer() {
    const app = express();
    app.use(BodyParser({ inflate: true, limit: "1mb" }));
    app.post("/message", route({ requestBody: "MessageCreateSchema" }), (req, res) =>
        res.json({
            nonceType: typeof req.body.nonce,
            nonce: req.body.nonce,
        }),
    );
    app.use(ErrorHandler);

    const server = http.createServer(app);
    await new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    assert(address && typeof address === "object");

    return {
        server,
        url: `http://${address.address}:${address.port}/message`,
    };
}

function postJson(url: string, body: string): Promise<{ statusCode: number | undefined; body: unknown }> {
    return new Promise((resolve, reject) => {
        const req = http.request(
            url,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(body),
                },
            },
            (res) => {
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        resolve({
                            statusCode: res.statusCode,
                            body: data ? JSON.parse(data) : null,
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            },
        );

        req.on("error", reject);
        req.end(body);
    });
}

describe("bigNumberToString", () => {
    test("converts nested own BigNumber values without changing other values", () => {
        const nullPrototypeChild = Object.assign(Object.create(null), {
            id: new BigNumber("400000000000000000004"),
            label: "null-prototype",
        });
        const body: {
            nonce: BigNumber | string;
            content: string;
            falsy: null;
            embeds: [
                {
                    id: BigNumber | string;
                    title: string;
                    nested: {
                        id: BigNumber | string;
                    };
                },
                BigNumber | string,
                null,
            ];
            nullPrototypeChild: typeof nullPrototypeChild;
        } = {
            nonce: new BigNumber("900719925474099312345"),
            content: "hello",
            falsy: null,
            embeds: [
                {
                    id: new BigNumber("100000000000000000001"),
                    title: "first",
                    nested: {
                        id: new BigNumber("200000000000000000002"),
                    },
                },
                new BigNumber("300000000000000000003"),
                null,
            ],
            nullPrototypeChild,
        };

        bigNumberToString(body);

        assert.equal(body.nonce, "900719925474099312345");
        assert.equal(body.content, "hello");
        assert.equal(body.falsy, null);
        assert.equal(body.embeds[0].id, "100000000000000000001");
        assert.equal(body.embeds[0].title, "first");
        assert.equal(body.embeds[0].nested.id, "200000000000000000002");
        assert.equal(body.embeds[1], "300000000000000000003");
        assert.equal(body.embeds[2], null);
        assert.equal(nullPrototypeChild.id, "400000000000000000004");
        assert.equal(nullPrototypeChild.label, "null-prototype");
    });

    test("skips inherited properties while walking with for-in", () => {
        const inherited = new BigNumber("500000000000000000005");
        const prototype = {
            inherited,
        };
        const body = Object.create(prototype) as { own: BigNumber; inherited: BigNumber | string };
        body.own = new BigNumber("600000000000000000006");

        bigNumberToString(body);

        assert.equal(body.own, "600000000000000000006");
        assert.equal(Object.hasOwn(body, "inherited"), false);
        assert.equal(body.inherited, inherited);
        assert.ok(prototype.inherited instanceof BigNumber);
    });

    test("ignores null and primitive inputs", () => {
        assert.doesNotThrow(() => bigNumberToString(null));
        assert.doesNotThrow(() => bigNumberToString(undefined));
        assert.doesNotThrow(() => bigNumberToString("text"));
        assert.doesNotThrow(() => bigNumberToString(1));
        assert.doesNotThrow(() => bigNumberToString(false));
    });

    test("normalizes unsafe JSON integers before route validation and handlers run", async () => {
        const { server, url } = await startRouteServer();
        try {
            const unsafeInteger = "900719925474099312345";
            const response = await postJson(url, `{"content":"x","nonce":${unsafeInteger}}`);

            assert.equal(response.statusCode, 200);
            assert.deepEqual(response.body, {
                nonceType: "string",
                nonce: unsafeInteger,
            });
        } finally {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()));
            });
        }
    });

    test("surfaces validation errors through production error handling", async () => {
        const { server, url } = await startRouteServer();
        try {
            const response = await postJson(url, `{"content":"x","tts":"not-a-boolean"}`);
            const body = response.body as {
                code: number;
                message: string;
                errors: { tts: { _errors: [{ code: string }] } };
            };

            assert.equal(response.statusCode, 400);
            assert.equal(body.code, 50035);
            assert.equal(body.message, "Invalid Form Body");
            assert.equal(body.errors.tts._errors[0].code, "type");
        } finally {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()));
            });
        }
    });
});
