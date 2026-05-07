import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Rights } from "@spacebar/util";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { createAdminAuthentication } from "./AdminAuthentication";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

function request(overrides: Partial<Request> = {}) {
    return {
        method: "GET",
        url: "/ping",
        headers: {},
        ip: "127.0.0.1",
        ...overrides,
    } as Request;
}

function response() {
    const res = {
        statusCode: 200,
        headers: {} as Record<string, number | string | readonly string[]>,
        setHeader(name: string, value: number | string | readonly string[]) {
            this.headers[name] = value;
            return this;
        },
        sendStatus(code: number) {
            this.statusCode = code;
            return this;
        },
    };

    return res as Response & typeof res;
}

function run(middleware: ReturnType<typeof createAdminAuthentication>, req: Request) {
    const res = response();

    return new Promise<{ error: unknown; res: Response & ReturnType<typeof response> }>((resolve) => {
        middleware(req, res, ((error?: unknown) => resolve({ error, res })) as NextFunction);
    });
}

describe("AdminAuthentication", () => {
    test("requires auth even for mounted public API route names", async () => {
        let authenticateCalled = false;
        const middleware = createAdminAuthentication(async () => {
            authenticateCalled = true;
            throw new HTTPError("Missing Authorization Header", 401);
        });

        const { error } = await run(middleware, request({ url: "/ping" }));

        assert.equal(authenticateCalled, true);
        assert.ok(error instanceof HTTPError);
        assert.equal((error as HTTPError).code, 401);
    });

    test("rejects authenticated users without OPERATOR", async () => {
        const middleware = createAdminAuthentication(async (req) => {
            req.user_id = "1";
            req.rights = new Rights(0);
        });

        const { error } = await run(middleware, request());

        assert.ok(error instanceof HTTPError);
        assert.equal((error as HTTPError).code, 403);
    });

    test("allows authenticated operators", async () => {
        const middleware = createAdminAuthentication(async (req) => {
            req.user_id = "1";
            req.rights = new Rights("OPERATOR");
        });

        const { error } = await run(middleware, request());

        assert.equal(error, undefined);
    });

    test("answers preflight without token validation", async () => {
        let authenticateCalled = false;
        const middleware = createAdminAuthentication(async () => {
            authenticateCalled = true;
        });
        const res = response();

        await middleware(request({ method: "OPTIONS" }), res, (() => undefined) as NextFunction);

        assert.equal(res.statusCode, 204);
        assert.equal(authenticateCalled, false);
    });
});
