import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

const { isNoAuthorizationRoute } = require("./Authentication") as typeof import("./Authentication");

describe("unauthenticated route matching", () => {
    test("ignores API version prefixes and query strings", () => {
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/experiments?with_guild_experiments=true"), true);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/apex/experiments?surface=2"), true);
    });

    test("accepts optional trailing slashes on exact public routes", () => {
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/experiments/?with_guild_experiments=true"), true);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/apex/experiments/?surface=2"), true);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/experiments/"), true);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/apex/experiments/"), true);
    });

    test("keeps protected routes protected when only their query string resembles a public route", () => {
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/users/@me?next=/experiments"), false);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/users/@me/?next=/experiments"), false);
    });

    test("does not treat exact public routes as public prefixes", () => {
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/experiments/not-a-route"), false);
        assert.equal(isNoAuthorizationRoute("GET", "/api/v9/apex/experiments/not-a-route"), false);
    });
});
