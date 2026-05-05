import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createBillingLocationInfoResponse } from "./BillingLocationInfo";

describe("createBillingLocationInfoResponse", () => {
    test("maps IpData country and region code fields", () => {
        assert.deepEqual(
            createBillingLocationInfoResponse({
                country_code: "US",
                region_code: "CA",
            }),
            {
                country_code: "US",
                subdivision_code: "CA",
            },
        );
    });

    test("keeps fields undefined when location data is unavailable", () => {
        assert.deepEqual(createBillingLocationInfoResponse(null), {});
    });

    test("omits subdivision_code when IpData has no region code", () => {
        assert.deepEqual(createBillingLocationInfoResponse({ country_code: "DE", region_code: "" }), {
            country_code: "DE",
        });
    });
});
