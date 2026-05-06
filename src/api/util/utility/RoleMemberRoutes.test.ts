import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

function getRoleMembersRouteSource() {
    return fs.readFileSync(path.join(process.cwd(), "src/api/routes/guilds/#guild_id/roles/#role_id/members.ts"), "utf8");
}

describe("role member update route", () => {
    test("registers PATCH additive and PUT replacement endpoints with the shared schema", () => {
        const source = getRoleMembersRouteSource();

        assert.ok(source.includes('requestBody: "RoleMembersUpdateSchema"'));
        assert.ok(source.includes('router.patch("/", routeOptions, (req: Request, res: Response) => updateRoleMembers(req, res, "add"));'));
        assert.ok(source.includes('router.put("/", routeOptions, (req: Request, res: Response) => updateRoleMembers(req, res, "replace"));'));
    });
});
