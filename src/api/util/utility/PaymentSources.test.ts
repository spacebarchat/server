import { describe, test } from "node:test";
import assert from "node:assert";
import type { Response } from "express";
import { getPaymentSource, listPaymentSources, sendPaymentSourceDeletedResponse, sendPaymentSourceResponse, sendPaymentSourcesResponse } from "./PaymentSources";

describe("PaymentSources", () => {
    test("uses the requested payment source id for single-source responses", () => {
        assert.strictEqual(getPaymentSource("custom_source_id").id, "custom_source_id");
    });

    test("lists the example payment source without mutating the single-source id", () => {
        const [paymentSource] = listPaymentSources();

        assert.strictEqual(paymentSource.id, "1422548914485198869");
        assert.strictEqual(paymentSource.billing_address.country, "US");
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
