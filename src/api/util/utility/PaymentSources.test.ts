import { describe, test } from "node:test";
import assert from "node:assert";
import type { Response } from "express";
import {
    createPaymentSource,
    getPaymentSource,
    listPaymentSources,
    redactPaymentSourceForList,
    sendCreatedPaymentSourceResponse,
    sendPaymentSourceDeletedResponse,
    sendPaymentSourceResponse,
    sendPaymentSourcesResponse,
} from "./PaymentSources";

describe("PaymentSources", () => {
    test("uses the requested payment source id for single-source responses", () => {
        assert.strictEqual(getPaymentSource("custom_source_id").id, "custom_source_id");
    });

    test("creates independent payment source examples", () => {
        const first = createPaymentSource("first_source_id");
        const second = createPaymentSource("second_source_id");

        first.billing_address.country = "DE";

        assert.strictEqual(first.id, "first_source_id");
        assert.strictEqual(second.id, "second_source_id");
        assert.strictEqual(second.billing_address.country, "US");
    });

    test("lists the example payment source without mutating the single-source id", () => {
        const [paymentSource] = listPaymentSources();

        assert.strictEqual(paymentSource.id, "1422548914485198869");
        assert.strictEqual(paymentSource.billing_address.country, "US");
        assert.strictEqual(paymentSource.billing_address.name, "John Doe");
        assert.strictEqual("line_1" in paymentSource.billing_address, false);
        assert.strictEqual("postal_code" in paymentSource.billing_address, false);
    });

    test("redacts list payment source billing addresses", () => {
        const paymentSource = redactPaymentSourceForList(createPaymentSource("source_id"));

        assert.strictEqual(paymentSource.id, "source_id");
        assert.deepStrictEqual(paymentSource.billing_address, {
            name: "John Doe",
            country: "US",
        });
    });

    test("sends single-source responses with the requested id", () => {
        const calls: unknown[] = [];
        const res = {
            status(code: number) {
                calls.push(["status", code]);
                return this;
            },
            json(body: unknown) {
                calls.push(["json", body]);
                return this;
            },
        } as Response;

        sendPaymentSourceResponse("custom_source_id", res);

        assert.deepStrictEqual(calls[0], ["status", 200]);
        assert.strictEqual((calls[1] as [string, { id: string }])[1].id, "custom_source_id");
    });

    test("sends list responses", () => {
        const calls: unknown[] = [];
        const res = {
            status(code: number) {
                calls.push(["status", code]);
                return this;
            },
            json(body: unknown) {
                calls.push(["json", body]);
                return this;
            },
        } as Response;

        sendPaymentSourcesResponse(res);

        assert.deepStrictEqual(calls[0], ["status", 200]);
        assert.strictEqual((calls[1] as [string, { id: string }[]])[1][0].id, "1422548914485198869");
        assert.ok(Array.isArray((calls[1] as [string, unknown[]])[1]));
    });

    test("sends created payment source responses as a single object", () => {
        const calls: unknown[] = [];
        const res = {
            status(code: number) {
                calls.push(["status", code]);
                return this;
            },
            json(body: unknown) {
                calls.push(["json", body]);
                return this;
            },
        } as Response;

        sendCreatedPaymentSourceResponse(res);

        assert.deepStrictEqual(calls[0], ["status", 200]);
        assert.strictEqual(Array.isArray((calls[1] as [string, unknown])[1]), false);
        assert.strictEqual((calls[1] as [string, { id: string }])[1].id, "1422548914485198869");
    });

    test("ends delete responses with 204", () => {
        const calls: unknown[] = [];
        const res = {
            sendStatus(code: number) {
                calls.push(["sendStatus", code]);
                return this;
            },
        } as Response;

        sendPaymentSourceDeletedResponse(res);

        assert.deepStrictEqual(calls, [["sendStatus", 204]]);
    });
});
