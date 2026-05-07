import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { JSONStringify } from "./JSON";

describe("JSONStringify", () => {
    test("serializes dates with Discord-compatible timezone suffix", () => {
        assert.equal(JSONStringify({ created_at: new Date("2026-05-05T21:30:00.000Z") }), '{"created_at":"2026-05-05T21:30:00.000+00:00"}');
    });

    test("preserves object toJSON serialization", () => {
        assert.equal(
            JSONStringify({
                entity: {
                    id: "hidden",
                    toJSON: () => ({ id: "public" }),
                },
            }),
            '{"entity":{"id":"public"}}',
        );
    });

    test("omits circular object references without dropping repeated siblings", () => {
        type Payload = {
            first: { id: string };
            second: { id: string };
            nested?: { parent: Payload };
        };

        const shared = { id: "shared" };
        const payload: Payload = {
            first: shared,
            second: shared,
        };
        payload.nested = { parent: payload };

        assert.equal(JSONStringify(payload), '{"first":{"id":"shared"},"second":{"id":"shared"},"nested":{}}');
    });

    test("serializes circular arrays without throwing", () => {
        const payload: unknown[] = ["start"];
        payload.push(payload);

        assert.equal(JSONStringify(payload), '["start",null]');
    });
});
