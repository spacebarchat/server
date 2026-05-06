import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getChannelModifyTypeConversionError } from "./ChannelModifyTypeConversion";

const ChannelType = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_NEWS: 5,
    GUILD_PUBLIC_THREAD: 11,
    GUILD_FORUM: 15,
} as const;

function assertAllowed(currentType: number, requestedType: number | undefined, guildFeatures: readonly string[] = []) {
    assert.equal(getChannelModifyTypeConversionError(currentType, requestedType, guildFeatures), undefined);
}

function assertRejected(currentType: number, requestedType: number | undefined, expectedMessage: string, guildFeatures: readonly string[] = []) {
    const error = getChannelModifyTypeConversionError(currentType, requestedType, guildFeatures);

    assert.equal(error?._errors[0].code, "BASE_TYPE_CHOICES");
    assert.equal(error?._errors[0].message, expectedMessage);
}

describe("channel modify type conversion guard", () => {
    test("allows no-op or omitted type updates without requiring guild features", () => {
        assertAllowed(ChannelType.GUILD_TEXT, undefined);
        assertAllowed(ChannelType.GUILD_TEXT, ChannelType.GUILD_TEXT);
        assertAllowed(ChannelType.GUILD_NEWS, ChannelType.GUILD_NEWS);
    });

    test("allows text to news conversion only with the NEWS guild feature", () => {
        assertAllowed(ChannelType.GUILD_TEXT, ChannelType.GUILD_NEWS, ["NEWS"]);

        assertRejected(ChannelType.GUILD_TEXT, ChannelType.GUILD_NEWS, "News channels require the NEWS guild feature");
    });

    test("allows news to text conversion without requiring the NEWS guild feature", () => {
        assertAllowed(ChannelType.GUILD_NEWS, ChannelType.GUILD_TEXT);
    });

    test("rejects conversions from non-convertible current channel types", () => {
        const rejectedTypes = [ChannelType.GUILD_VOICE, ChannelType.GUILD_CATEGORY, ChannelType.GUILD_FORUM, ChannelType.GUILD_PUBLIC_THREAD, ChannelType.DM, ChannelType.GROUP_DM];

        for (const currentType of rejectedTypes) {
            assertRejected(currentType, ChannelType.GUILD_TEXT, "Only text and news channels can be converted");
            assertRejected(currentType, ChannelType.GUILD_NEWS, "Only text and news channels can be converted", ["NEWS"]);
        }
    });
});
