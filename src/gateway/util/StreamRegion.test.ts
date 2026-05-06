import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectStreamRegion } from "./StreamRegion";

const regions = {
    default: "default",
    useDefaultAsOptimal: true,
    available: [
        {
            id: "default",
            name: "Default Region",
            endpoint: "default.example:443",
            vip: false,
            custom: false,
            deprecated: false,
        },
        {
            id: "preferred",
            name: "Preferred Region",
            endpoint: "preferred.example:443",
            vip: false,
            custom: false,
            deprecated: false,
        },
    ],
};

describe("selectStreamRegion", () => {
    it("uses the preferred region when it is configured", () => {
        assert.equal(selectStreamRegion(regions, "preferred").endpoint, "preferred.example:443");
    });

    it("uses the preferred region when the default region is misconfigured", () => {
        assert.equal(
            selectStreamRegion(
                {
                    ...regions,
                    default: "missing",
                },
                "preferred",
            ).endpoint,
            "preferred.example:443",
        );
    });

    it("falls back to the default region when no preferred region is requested", () => {
        assert.equal(selectStreamRegion(regions).endpoint, "default.example:443");
        assert.equal(selectStreamRegion(regions, "").endpoint, "default.example:443");
    });

    it("falls back to the default region when the preferred region is unknown", () => {
        assert.equal(selectStreamRegion(regions, "missing").endpoint, "default.example:443");
    });

    it("uses the first configured region when ids are duplicated", () => {
        assert.equal(
            selectStreamRegion(
                {
                    ...regions,
                    available: [
                        ...regions.available,
                        {
                            id: "preferred",
                            name: "Duplicate Preferred Region",
                            endpoint: "duplicate.example:443",
                            vip: false,
                            custom: false,
                            deprecated: false,
                        },
                    ],
                },
                "preferred",
            ).endpoint,
            "preferred.example:443",
        );
    });

    it("throws when neither preferred nor default region can be selected", () => {
        assert.throws(
            () =>
                selectStreamRegion(
                    {
                        ...regions,
                        default: "missing",
                        available: [],
                    },
                    "missing",
                ),
            /No default region configured/,
        );
    });
});
