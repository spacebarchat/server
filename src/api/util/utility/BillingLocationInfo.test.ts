import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createBillingLocationInfoResponse } from "./BillingLocationInfo";

describe("createBillingLocationInfoResponse", () => {
    test("maps IpData country and region code fields to a full subdivision code", () => {
        assert.deepEqual(
            createBillingLocationInfoResponse({
                country_code: "US",
                region_code: "CA",
            }),
            {
                country_code: "US",
                subdivision_code: "US-CA",
            },
        );
    });

    test("keeps already-prefixed subdivision codes unchanged", () => {
        assert.deepEqual(
            createBillingLocationInfoResponse({
                country_code: "US",
                region_code: "US-CA",
            }),
            {
                country_code: "US",
                subdivision_code: "US-CA",
            },
        );
    });

    test("preserves the previous empty response when location data is unavailable", () => {
        assert.deepEqual(createBillingLocationInfoResponse(null), {});
    });

    test("omits subdivision_code when IpData has no region code", () => {
        assert.deepEqual(createBillingLocationInfoResponse({ country_code: "DE", region_code: "" }), {
            country_code: "DE",
        });
    });

    test("omits subdivision_code when IpData has no country code", () => {
        assert.deepEqual(createBillingLocationInfoResponse({ region_code: "CA" }), {});
    });
});
