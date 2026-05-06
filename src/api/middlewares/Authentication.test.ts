/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let NO_AUTHORIZATION_ROUTES: (typeof import("./Authentication"))["NO_AUTHORIZATION_ROUTES"];

function skipsAuthentication(method: string, url: string) {
    return NO_AUTHORIZATION_ROUTES.some((route) => {
        if (typeof route === "string") {
            return route === `${method} ${url}`;
        }

        return route.test(`${method} ${url}`);
    });
}

before(async () => {
    process.env.DATABASE ??= "postgres://user:pass@localhost:5432/test";
    ({ NO_AUTHORIZATION_ROUTES } = await import("./Authentication.js"));
});

describe("Authentication webhook bypass routes", () => {
    it("allows unauthenticated webhook requests with base64url tokens that start with a dash", () => {
        assert.equal(skipsAuthentication("GET", "/webhooks/123/-abc_DEF/messages/456"), true);
        assert.equal(skipsAuthentication("PATCH", "/webhooks/123/-abc_DEF/messages/456"), true);
        assert.equal(skipsAuthentication("DELETE", "/webhooks/123/-abc_DEF/messages/456"), true);
    });

    it("bounds webhook token segments before the next slash or end of URL", () => {
        assert.equal(skipsAuthentication("GET", "/webhooks/123/abc_DEF"), true);
        assert.equal(skipsAuthentication("GET", "/webhooks/123/abc.DEF/messages/456"), false);
    });
});
