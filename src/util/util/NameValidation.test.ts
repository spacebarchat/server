/*
    Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
    Copyright (C) 2023 Spacebar and Spacebar Contributors
    
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

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { ValidateName } from "./NameValidation";
import { FieldError } from "./FieldError";

describe("ValidateName", () => {
    it("should accept valid usernames", () => {
        assert.equal(ValidateName("ValidBot"), "ValidBot");
        assert.equal(ValidateName("Captain Hook"), "Captain Hook");
    });

    it("should throw FieldErrors with BASE_TYPE_REQUIRED for empty or whitespace usernames", () => {
        assert.throws(
            () => ValidateName("   "),
            (err) => {
                assert(err instanceof FieldError);
                assert.equal(err.code, 50035);
                assert.equal(err.errors?.username?._errors[0]?.code, "BASE_TYPE_REQUIRED");
                return true;
            },
        );
    });

    it("should throw FieldErrors with BASE_TYPE_BAD_LENGTH for too short usernames", () => {
        assert.throws(
            () => ValidateName("a"),
            (err) => {
                assert(err instanceof FieldError);
                assert.equal(err.code, 50035);
                assert.equal(err.errors?.username?._errors[0]?.code, "BASE_TYPE_BAD_LENGTH");
                return true;
            },
        );
    });

    it("should throw FieldErrors with BASE_TYPE_BAD_LENGTH for too long usernames", () => {
        assert.throws(
            () => ValidateName("a".repeat(35)),
            (err) => {
                assert(err instanceof FieldError);
                assert.equal(err.code, 50035);
                assert.equal(err.errors?.username?._errors[0]?.code, "BASE_TYPE_BAD_LENGTH");
                return true;
            },
        );
    });

    it("should throw FieldErrors with USERNAME_CONTAINS_BLOCKED_WORD when name contains blocked substring", () => {
        assert.throws(
            () => ValidateName("Fake Discord Bot"),
            (err) => {
                assert(err instanceof FieldError);
                assert.equal(err.code, 50035);
                assert.equal(err.errors?.username?._errors[0]?.code, "USERNAME_CONTAINS_BLOCKED_WORD");
                assert.equal(err.errors?.username?._errors[0]?.message, 'Username cannot contain "discord"');
                return true;
            },
        );
    });

    it("should throw FieldErrors with USERNAME_BLOCKED when name matches blocked word exactly", () => {
        assert.throws(
            () => ValidateName("everyone"),
            (err) => {
                assert(err instanceof FieldError);
                assert.equal(err.code, 50035);
                assert.equal(err.errors?.username?._errors[0]?.code, "USERNAME_BLOCKED");
                assert.equal(err.errors?.username?._errors[0]?.message, 'Username cannot be "everyone"');
                return true;
            },
        );
    });
});
