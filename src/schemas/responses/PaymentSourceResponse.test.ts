import { describe, test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";

const schemas = JSON.parse(readFileSync(join(process.cwd(), "assets/schemas.json"), "utf8")) as Record<string, object>;
const openapi = JSON.parse(readFileSync(join(process.cwd(), "assets/openapi.json"), "utf8")) as { paths: Record<string, Record<string, { responses?: Record<string, unknown> }>> };
const ajv = new Ajv({ schemas: Object.entries(schemas).map(([key, schema]) => ({ ...schema, $id: key })) });

describe("PaymentSourceResponse", () => {
    const validate = ajv.compile({ ...schemas.PaymentSourceResponse, definitions: schemas });

    test("accepts the current billing payment source response shape", () => {
        assert.ok(validate);
        assert.strictEqual(
            validate({
                id: "1422548914485198869",
                type: 1,
                invalid: false,
                flags: 2,
                deleted_at: null,
                brand: "visa",
                last_4: "4242",
                expires_month: 9,
                expires_year: 2077,
                billing_address: {
                    name: "John Doe",
                    line_1: "123 Main Street",
                    line_2: "Apt 4B",
                    city: "San Francisco",
                    state: "CA",
                    country: "US",
                    postal_code: "94105",
                },
                country: "US",
                payment_gateway: 1,
                payment_gateway_source_id: "pm_DwiVlGlYwe1qxLzy4QWChQeo",
                default: false,
            }),
            true,
        );
    });

    test("accepts partial list billing addresses without card-only fields", () => {
        assert.ok(validate);
        assert.strictEqual(
            validate({
                id: "1422548914485198869",
                type: 2,
                payment_gateway: 2,
                default: true,
                invalid: false,
                flags: 0,
                billing_address: {
                    name: "John Doe",
                    country: "US",
                },
                email: "john@example.com",
            }),
            true,
        );
    });

    test("requires a payment source id", () => {
        assert.ok(validate);
        assert.strictEqual(
            validate({
                type: 1,
                invalid: false,
                flags: 2,
                deleted_at: null,
                brand: "visa",
                last_4: "4242",
                expires_month: 9,
                expires_year: 2077,
                billing_address: {
                    name: "John Doe",
                    line_1: "123 Main Street",
                    line_2: null,
                    city: "San Francisco",
                    state: "CA",
                    country: "US",
                    postal_code: "94105",
                },
                country: "US",
                payment_gateway: 1,
                payment_gateway_source_id: "pm_DwiVlGlYwe1qxLzy4QWChQeo",
                default: false,
            }),
            false,
        );
    });

    test("documents delete payment source as a 204 response", () => {
        assert.ok(openapi.paths["/users/@me/billing/payment-sources/{payment_source_id}"]?.delete?.responses?.["204"]);
    });

    test("documents create payment source as a single-object response", () => {
        assert.deepStrictEqual(openapi.paths["/users/@me/billing/payment-sources/"]?.post?.responses?.["200"], {
            description: "",
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/PaymentSourceResponse",
                    },
                },
            },
        });
    });
});
