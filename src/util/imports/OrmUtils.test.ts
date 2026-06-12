import moduleAlias from "module-alias";
moduleAlias(__dirname + "../../../../package.json");
import { config } from "dotenv";
config({ quiet: true });

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { OrmUtils } from "./OrmUtils";

describe("OrmUtils", () => {
    test("should be able convert string keys to boolean object", () => {
        const keys = ["member", "member.user", "member.guild.meow", "member.guild", "guild.name"];
        const expected = {
            member: {
                user: true,
                guild: {
                    meow: true,
                },
            },
            guild: {
                name: true,
            },
        };
        const result = OrmUtils.keysToObject(keys);
        assert.deepStrictEqual(result, expected);
    });
});
