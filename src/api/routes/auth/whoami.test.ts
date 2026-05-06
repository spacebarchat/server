import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { Request } from "express";
import { getWhoAmIResponse } from "./whoamiResponse";

describe("getWhoAmIResponse", () => {
    it("should serialize the authenticated request identity from a JWT issued-at timestamp", () => {
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
                iat: 1_700_000_000,
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

    it("should keep the generated schema and OpenAPI route metadata in sync", () => {
        const schemasPath = path.join(process.cwd(), "assets", "schemas.json");
        const openApiPath = path.join(process.cwd(), "assets", "openapi.json");
        const schemas = JSON.parse(fs.readFileSync(schemasPath, "utf8"));
        const openApi = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

        assert.ok(schemas.WhoAmIResponse);
        assert.deepEqual(Object.keys(schemas.WhoAmIResponse.properties).sort(), ["device_id", "flags", "id", "logged_in_since", "rights"]);
        assert.equal(openApi.paths["/auth/whoami/"].get.responses["200"].content["application/json"].schema.$ref, "#/components/schemas/WhoAmIResponse");
    });
});
