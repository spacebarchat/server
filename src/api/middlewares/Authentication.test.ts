import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

const { isNoAuthorizationRoute } = require("./Authentication") as typeof import("./Authentication");

describe("unauthenticated route matching", () => {
    test("ignores API version prefixes and query strings", () => {
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/experiments?with_guild_experiments=true"), true);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/apex/experiments?surface=2"), true);
    });

    test("keeps protected routes protected when only their query string resembles a public route", () => {
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/users/@me?next=/experiments"), false);
    });
});
