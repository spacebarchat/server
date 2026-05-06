import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DiscordApiErrors } from "../../../util/util/Constants";
import {
    CROSSPOST_BASE_PERMISSION,
    CROSSPOST_MANAGE_PERMISSION,
    CROSSPOST_SEND_PERMISSION,
    CROSSPOSTABLE_CHANNEL_TYPE,
    CROSSPOSTABLE_MESSAGE_TYPE,
    CROSSPOSTED_MESSAGE_FLAG,
    crosspostMessage,
    type CrosspostMessageData,
    type CrosspostMessagePermission,
    type CrosspostPermissionGuard,
    type CrosspostRightsGuard,
    getCrosspostRejectionReason,
    markMessageCrossposted,
    shouldRequireCrosspostManagePermission,
} from "./CrosspostMessage";

type PublicCrosspostMessage = {
    id: string;
    author_id: string;
    type: number;
    flags: number;
};

type CrosspostUpdateEvent = {
    event: "MESSAGE_UPDATE";
    channel_id: string;
    data: PublicCrosspostMessage;
};

class FakeMessage implements CrosspostMessageData<PublicCrosspostMessage> {
    author_id = "author";
    type = CROSSPOSTABLE_MESSAGE_TYPE;
    flags = 0;
    saveCalls = 0;

    constructor(overrides: Partial<Pick<CrosspostMessageData<PublicCrosspostMessage>, "author_id" | "type" | "flags">> = {}) {
        Object.assign(this, overrides);
    }

    async save() {
        this.saveCalls += 1;
    }

    toJSON(): PublicCrosspostMessage {
        return {
            id: "message",
            author_id: this.author_id,
            type: this.type,
            flags: this.flags,
        };
    }
}

class RecordingPermission implements CrosspostPermissionGuard {
    calls: CrosspostMessagePermission[] = [];

    constructor(private readonly denied: Partial<Record<CrosspostMessagePermission, Error>> = {}) {}

    hasThrow(permission: CrosspostMessagePermission) {
        this.calls.push(permission);
        const error = this.denied[permission];
        if (error) throw error;
        return true;
    }
}

function createRights(hasManageMessages: boolean): CrosspostRightsGuard {
    return {
        has(permission) {
            return permission === CROSSPOST_MANAGE_PERMISSION && hasManageMessages;
        },
    };
}

async function assertRejectsWith(block: () => Promise<unknown>, expected: Error) {
    await assert.rejects(block, (error) => {
        assert.equal(error, expected);
        return true;
    });
}

function assertNoMutation(message: FakeMessage, events: CrosspostUpdateEvent[]) {
    assert.equal(message.saveCalls, 0);
    assert.deepEqual(events, []);
}

describe("crosspost message helpers", () => {
    test("requires view channel before crosspost-specific message permissions", () => {
        assert.equal(CROSSPOST_BASE_PERMISSION, "VIEW_CHANNEL");
    });

    test("uses send messages as the crosspost mutation permission", () => {
        assert.equal(CROSSPOST_SEND_PERMISSION, "SEND_MESSAGES");
    });

    test("uses manage messages as the additional non-author permission", () => {
        assert.equal(CROSSPOST_MANAGE_PERMISSION, "MANAGE_MESSAGES");
    });

    test("requires manage messages for non-authors and messages without a normal author", () => {
        assert.equal(shouldRequireCrosspostManagePermission("author", "author"), false);
        assert.equal(shouldRequireCrosspostManagePermission("author", "moderator"), true);
        assert.equal(shouldRequireCrosspostManagePermission(undefined, "moderator"), true);
    });

    test("marks messages as crossposted without clearing existing flags", () => {
        const existingFlags = 1 << 2;

        assert.equal(markMessageCrossposted(existingFlags), existingFlags | CROSSPOSTED_MESSAGE_FLAG);
    });

    test("rejects already crossposted messages", () => {
        const crossposted = CROSSPOSTED_MESSAGE_FLAG;

        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE, crossposted), "already_crossposted");
    });

    test("allows default messages in announcement channels", () => {
        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE, 0), undefined);
    });

    test("rejects non-announcement channels", () => {
        assert.equal(getCrosspostRejectionReason(0, CROSSPOSTABLE_MESSAGE_TYPE, 0), "channel_type");
    });

    test("rejects system messages", () => {
        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, 6, 0), "message_type");
    });
});

describe("crosspost message service", () => {
    test("successful crosspost saves the flag and emits one message update", async () => {
        const message = new FakeMessage();
        const permission = new RecordingPermission();
        const events: CrosspostUpdateEvent[] = [];

        const response = await crosspostMessage({
            channel: { type: CROSSPOSTABLE_CHANNEL_TYPE },
            channelId: "channel",
            emitEvent: (event) => events.push(event),
            getRights: () => {
                throw new Error("authors should not need rights lookup");
            },
            message,
            permission,
            userId: "author",
        });

        assert.equal(message.flags, CROSSPOSTED_MESSAGE_FLAG);
        assert.equal(message.saveCalls, 1);
        assert.deepEqual(permission.calls, [CROSSPOST_SEND_PERMISSION]);
        assert.deepEqual(events, [
            {
                event: "MESSAGE_UPDATE",
                channel_id: "channel",
                data: response,
            },
        ]);
        assert.deepEqual(response, {
            id: "message",
            author_id: "author",
            type: CROSSPOSTABLE_MESSAGE_TYPE,
            flags: CROSSPOSTED_MESSAGE_FLAG,
        });
    });

    test("already-crossposted messages throw without saving or emitting", async () => {
        const message = new FakeMessage({ flags: CROSSPOSTED_MESSAGE_FLAG });
        const permission = new RecordingPermission();
        const events: CrosspostUpdateEvent[] = [];

        await assertRejectsWith(
            () =>
                crosspostMessage({
                    channel: { type: CROSSPOSTABLE_CHANNEL_TYPE },
                    channelId: "channel",
                    emitEvent: (event) => events.push(event),
                    message,
                    permission,
                    userId: "author",
                }),
            DiscordApiErrors.ALREADY_CROSSPOSTED,
        );

        assert.deepEqual(permission.calls, []);
        assertNoMutation(message, events);
    });

    test("non-news channels throw without saving or emitting", async () => {
        const message = new FakeMessage();
        const permission = new RecordingPermission();
        const events: CrosspostUpdateEvent[] = [];

        await assertRejectsWith(
            () =>
                crosspostMessage({
                    channel: { type: 0 },
                    channelId: "channel",
                    emitEvent: (event) => events.push(event),
                    message,
                    permission,
                    userId: "author",
                }),
            DiscordApiErrors.CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE,
        );

        assert.deepEqual(permission.calls, []);
        assertNoMutation(message, events);
    });

    test("system messages throw without saving or emitting", async () => {
        const message = new FakeMessage({ type: 6 });
        const permission = new RecordingPermission();
        const events: CrosspostUpdateEvent[] = [];

        await assertRejectsWith(
            () =>
                crosspostMessage({
                    channel: { type: CROSSPOSTABLE_CHANNEL_TYPE },
                    channelId: "channel",
                    emitEvent: (event) => events.push(event),
                    message,
                    permission,
                    userId: "author",
                }),
            DiscordApiErrors.CANNOT_EXECUTE_ON_SYSTEM_MESSAGE,
        );

        assert.deepEqual(permission.calls, []);
        assertNoMutation(message, events);
    });

    test("non-authors without channel manage messages fail and do not mutate", async () => {
        const missingManageMessages = new Error("missing MANAGE_MESSAGES");
        const message = new FakeMessage({ author_id: "author" });
        const permission = new RecordingPermission({ [CROSSPOST_MANAGE_PERMISSION]: missingManageMessages });
        const events: CrosspostUpdateEvent[] = [];

        await assertRejectsWith(
            () =>
                crosspostMessage({
                    channel: { type: CROSSPOSTABLE_CHANNEL_TYPE },
                    channelId: "channel",
                    emitEvent: (event) => events.push(event),
                    getRights: () => createRights(false),
                    message,
                    permission,
                    userId: "moderator",
                }),
            missingManageMessages,
        );

        assert.deepEqual(permission.calls, [CROSSPOST_MANAGE_PERMISSION]);
        assertNoMutation(message, events);
    });

    test("author send permission guard failures do not mutate", async () => {
        const missingSendMessages = new Error("missing SEND_MESSAGES");
        const message = new FakeMessage();
        const permission = new RecordingPermission({ [CROSSPOST_SEND_PERMISSION]: missingSendMessages });
        const events: CrosspostUpdateEvent[] = [];

        await assertRejectsWith(
            () =>
                crosspostMessage({
                    channel: { type: CROSSPOSTABLE_CHANNEL_TYPE },
                    channelId: "channel",
                    emitEvent: (event) => events.push(event),
                    message,
                    permission,
                    userId: "author",
                }),
            missingSendMessages,
        );

        assert.deepEqual(permission.calls, [CROSSPOST_SEND_PERMISSION]);
        assertNoMutation(message, events);
    });

    test("global manage messages right bypasses only the non-author manage channel permission", async () => {
        const message = new FakeMessage({ author_id: "author" });
        const permission = new RecordingPermission();
        const events: CrosspostUpdateEvent[] = [];
        const rightsLookups: string[] = [];

        await crosspostMessage({
            channel: { type: CROSSPOSTABLE_CHANNEL_TYPE },
            channelId: "channel",
            emitEvent: (event) => events.push(event),
            getRights: (userId) => {
                rightsLookups.push(userId);
                return createRights(true);
            },
            message,
            permission,
            userId: "moderator",
        });

        assert.equal(message.saveCalls, 1);
        assert.deepEqual(permission.calls, []);
        assert.deepEqual(rightsLookups, ["moderator"]);
        assert.equal(events.length, 1);
    });
});
