import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Request } from "express";
import { getWhoAmIResponse } from "./whoamiResponse";

describe("getWhoAmIResponse", () => {
    it("should serialize the authenticated request identity", () => {
        const req = {
            user_id: "123",
            session: {
                session_id: "device-1",
            },
            user: {
                flags: 64,
                rights: "875069521787904",
            },
            token: {
                iat: 1_700_000_000_000,
            },
        } as unknown as Request;

        assert.deepEqual(getWhoAmIResponse(req), {
            id: "123",
            device_id: "device-1",
            flags: 64,
            rights: "875069521787904",
            logged_in_since: "2023-11-14T22:13:20.000Z",
        });
    });

    it("should preserve the route fallback shape when session or user data is absent", () => {
        const req = {
            user_id: "123",
            token: {
                iat: 0,
            },
        } as unknown as Request;

        assert.deepEqual(getWhoAmIResponse(req), {
            id: "123",
            device_id: null,
            flags: 0,
            rights: 0,
            logged_in_since: "1970-01-01T00:00:00.000Z",
        });
    });
});
