/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ajv } from "../Validator";

const assetsPath = path.join(process.cwd(), "assets");

interface JsonShape {
    const?: unknown;
    properties?: Record<string, JsonShape>;
    type?: string | string[];
}

function readAssetJson<T>(name: string): T {
    return JSON.parse(fs.readFileSync(path.join(assetsPath, name), "utf8")) as T;
}

test("LoginResponse keeps sms disabled for MFA challenges", () => {
    const schemas = readAssetJson<Record<string, JsonShape>>("schemas.json");

    assert.deepEqual(schemas.MFAResponse.properties?.sms, {
        type: "boolean",
        const: false,
    });
    assert.deepEqual(schemas.WebAuthnResponse.properties?.sms, {
        type: "boolean",
        const: false,
    });
});

test("LoginResponse validates TOTP and WebAuthn MFA challenges", () => {
    const mfaResponse = {
        ticket: "ticket",
        mfa: true,
        sms: false,
        token: null,
    };

    assert.equal(ajv.validate("LoginResponse", mfaResponse), true);
    assert.equal(ajv.validate("LoginResponse", { ...mfaResponse, sms: true }), false);
    assert.equal(ajv.validate("LoginResponse", { ...mfaResponse, webauthn: "challenge" }), true);
    assert.equal(ajv.validate("LoginResponse", { ...mfaResponse, sms: true, webauthn: "challenge" }), false);
});
