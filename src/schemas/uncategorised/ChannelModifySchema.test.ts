import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schemas = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "assets", "schemas.json"), { encoding: "utf8" }).replaceAll("#/definitions/", ""));
const ajv = new Ajv({
    allErrors: true,
    allowUnionTypes: true,
    coerceTypes: true,
    schemas,
    strict: true,
    strictRequired: true,
});

addFormats(ajv);

const ChannelType = {
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    GUILD_CATEGORY: 4,
    GUILD_NEWS: 5,
    GUILD_PUBLIC_THREAD: 11,
    GUILD_FORUM: 15,
    UNHANDLED: 255,
} as const;

describe("ChannelModifySchema", () => {
    test("only accepts text and news type conversions", () => {
        const validate = ajv.getSchema("ChannelModifySchema");
        assert.ok(validate);

        assert.equal(validate({ type: ChannelType.GUILD_TEXT }), true);
        assert.equal(validate({ type: ChannelType.GUILD_NEWS }), true);
        assert.equal(validate({ type: ChannelType.GUILD_VOICE }), false);
        assert.equal(validate({ type: ChannelType.GUILD_CATEGORY }), false);
        assert.equal(validate({ type: ChannelType.GUILD_PUBLIC_THREAD }), false);
        assert.equal(validate({ type: ChannelType.GUILD_FORUM }), false);
        assert.equal(validate({ type: ChannelType.UNHANDLED }), false);
    });
});

describe("ChannelCreateSchema", () => {
    test("keeps full channel type creation support", () => {
        const validate = ajv.getSchema("ChannelCreateSchema");
        assert.ok(validate);

        assert.equal(validate({ name: "voice", type: ChannelType.GUILD_VOICE }), true);
        assert.equal(validate({ name: "forum", type: ChannelType.GUILD_FORUM }), true);
    });
});
