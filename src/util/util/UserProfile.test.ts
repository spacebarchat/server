import "reflect-metadata";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { profilePronouns } from "./UserProfile";
import type { Member as MemberType } from "../entities/Member";
import type { User as UserType } from "../entities/User";

process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost/spacebar";

// Load User before Member to match the entity dependency order used by the
// application barrel and avoid exercising unrelated circular import edges in
// this focused DTO serialization test.
const { User } = require("../entities/User") as typeof import("../entities/User");
const { Member } = require("../entities/Member") as typeof import("../entities/Member");

function userWithPronouns(pronouns: string | null | undefined): UserType {
    const user = new User();
    user.id = "1";
    user.username = "profile-user";
    user.discriminator = "0001";
    user.public_flags = 0;
    user.premium_type = 0;
    (user as unknown as { pronouns: string | null | undefined }).pronouns = pronouns;
    return user;
}

function memberWithPronouns(pronouns: string | null | undefined, user: UserType = userWithPronouns("they/them")): MemberType {
    const member = new Member();
    member.id = user.id;
    member.guild_id = "2";
    member.roles = [];
    member.joined_at = new Date("2026-01-01T00:00:00.000Z");
    member.pending = false;
    member.deaf = false;
    member.mute = false;
    member.bio = "";
    member.flags = 0;
    member.user = user;
    (member as unknown as { pronouns: string | null | undefined }).pronouns = pronouns;
    return member;
}

describe("profilePronouns", () => {
    test("serializes absent pronouns as an empty string", () => {
        assert.equal(profilePronouns(null), "");
        assert.equal(profilePronouns(undefined), "");
    });

    test("preserves explicit pronouns", () => {
        assert.equal(profilePronouns("they/them"), "they/them");
        assert.equal(profilePronouns(""), "");
    });
});

describe("pronoun serialization", () => {
    test("normalizes absent pronouns in public users", () => {
        assert.equal(userWithPronouns(null).toPublicUser().pronouns, "");
        assert.equal(userWithPronouns(undefined).toPublicUser().pronouns, "");
        assert.equal("pronouns" in userWithPronouns(undefined).toPublicUser(), true);
    });

    test("preserves explicit public user pronouns", () => {
        assert.equal(userWithPronouns("they/them").toPublicUser().pronouns, "they/them");
        assert.equal(userWithPronouns("").toPublicUser().pronouns, "");
    });

    test("normalizes absent pronouns in private users", () => {
        assert.equal(userWithPronouns(null).toPrivateUser().pronouns, "");
        assert.equal(userWithPronouns(undefined).toPrivateUser().pronouns, "");
        assert.equal("pronouns" in userWithPronouns(undefined).toPrivateUser(), true);
    });

    test("preserves explicit private user pronouns", () => {
        assert.equal(userWithPronouns("they/them").toPrivateUser().pronouns, "they/them");
        assert.equal(userWithPronouns("").toPrivateUser().pronouns, "");
    });

    test("normalizes absent pronouns in public members", () => {
        assert.equal(memberWithPronouns(null).toPublicMember().pronouns, "");
        assert.equal(memberWithPronouns(undefined).toPublicMember().pronouns, "");
        assert.equal("pronouns" in memberWithPronouns(undefined).toPublicMember(), true);
    });

    test("preserves explicit public member pronouns", () => {
        assert.equal(memberWithPronouns("they/them").toPublicMember().pronouns, "they/them");
        assert.equal(memberWithPronouns("").toPublicMember().pronouns, "");
    });

    test("normalizes absent pronouns in nested public member users", () => {
        assert.equal(memberWithPronouns("member pronouns", userWithPronouns(null)).toPublicMember().user.pronouns, "");
        assert.equal(memberWithPronouns("member pronouns", userWithPronouns(undefined)).toPublicMember().user.pronouns, "");
        assert.equal("pronouns" in memberWithPronouns("member pronouns", userWithPronouns(undefined)).toPublicMember().user, true);
    });

    test("preserves explicit nested public member user pronouns", () => {
        assert.equal(memberWithPronouns("member pronouns", userWithPronouns("they/them")).toPublicMember().user.pronouns, "they/them");
        assert.equal(memberWithPronouns("member pronouns", userWithPronouns("")).toPublicMember().user.pronouns, "");
    });
});
