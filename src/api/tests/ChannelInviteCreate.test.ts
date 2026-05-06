process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar-test";

import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";

const util = require("@spacebar/util");
const eventUtil = require("../../util/util/Event");
const randomInviteId = require("../util/utility/RandomInviteID");
const { createChannelInvite } = require("../util/handlers/ChannelInviteCreate");

type InviteBody = {
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
    flags?: number;
    target_user_id?: string;
    target_user_type?: number;
};

type InviteRecord = InstanceType<typeof util.Invite> & {
    code: string;
    guild_id: string;
    channel_id: string;
    inviter_id?: string;
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;
    flags: number;
    created_at: Date;
    expires_at?: Date;
    target_user_id?: string;
    target_user_type?: number;
};

const originalMethods = {
    channelFindOneOrFail: util.Channel.findOneOrFail,
    guildFindOne: util.Guild.findOne,
    inviteFind: util.Invite.find,
    inviteSave: util.Invite.prototype.save,
    inviteToJSON: util.Invite.prototype.toJSON,
    userGetPublicUser: util.User.getPublicUser,
    emitEvent: eventUtil.emitEvent,
    randomString: randomInviteId.randomString,
};

function restoreMethods() {
    util.Channel.findOneOrFail = originalMethods.channelFindOneOrFail;
    util.Guild.findOne = originalMethods.guildFindOne;
    util.Invite.find = originalMethods.inviteFind;
    util.Invite.prototype.save = originalMethods.inviteSave;
    util.Invite.prototype.toJSON = originalMethods.inviteToJSON;
    util.User.getPublicUser = originalMethods.userGetPublicUser;
    eventUtil.emitEvent = originalMethods.emitEvent;
    randomInviteId.randomString = originalMethods.randomString;
}

afterEach(restoreMethods);

function isNullFindOperator(value: unknown) {
    return typeof value === "object" && value !== null && (value as { _type?: string })._type === "isNull";
}

function matchesWhere(invite: InviteRecord, where: Record<string, unknown>) {
    return Object.entries(where).every(([key, expected]) => {
        const actual = invite[key as keyof InviteRecord];
        if (isNullFindOperator(expected)) return actual === undefined || actual === null;
        return actual === expected;
    });
}

function toPlainInvite(invite: InviteRecord) {
    return {
        code: invite.code,
        guild_id: invite.guild_id,
        channel_id: invite.channel_id,
        inviter_id: invite.inviter_id,
        uses: invite.uses,
        max_uses: invite.max_uses,
        max_age: invite.max_age,
        temporary: invite.temporary,
        flags: invite.flags,
        created_at: invite.created_at,
        expires_at: invite.expires_at,
        target_user_id: invite.target_user_id,
        target_user_type: invite.target_user_type,
    };
}

let storedInviteCounter = 0;

function createStoredInvite(overrides: Partial<InviteRecord> = {}): InviteRecord {
    const invite = new util.Invite() as InviteRecord;
    Object.assign(invite, {
        code: `invite-${++storedInviteCounter}`,
        guild_id: "guild-id",
        channel_id: "channel-id",
        inviter_id: "user-id",
        uses: 0,
        max_uses: 0,
        max_age: 86400,
        temporary: false,
        flags: 0,
        created_at: new Date(Date.now() - 1000),
        expires_at: new Date(Date.now() + 86400 * 1000),
        ...overrides,
    });
    return invite;
}

function installInviteRouteHarness(invites: InviteRecord[] = []) {
    const emittedEvents: unknown[] = [];
    let generatedInviteCounter = 0;

    util.Channel.findOneOrFail = async () => ({
        id: "channel-id",
        name: "general",
        type: 0,
        guild_id: "guild-id",
    });
    util.Guild.findOne = async () => ({ id: "guild-id", name: "Guild" });
    util.User.getPublicUser = async (id: string) => ({ id, username: "inviter" });
    eventUtil.emitEvent = async (payload: unknown) => {
        emittedEvents.push(payload);
    };
    randomInviteId.randomString = () => `generated-${++generatedInviteCounter}`;

    util.Invite.find = async ({ where, order }: { where: Record<string, unknown>; order?: { created_at?: "ASC" | "DESC" } }) => {
        const matches = invites.filter((invite) => matchesWhere(invite, where));
        if (order?.created_at === "ASC") return matches.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
        if (order?.created_at === "DESC") return matches.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        return matches;
    };

    util.Invite.prototype.save = async function save(this: InviteRecord) {
        if (!invites.some((invite) => invite.code === this.code)) invites.push(this);
        return this;
    };

    util.Invite.prototype.toJSON = function toJSON(this: InviteRecord) {
        return toPlainInvite(this);
    };

    return { emittedEvents, invites };
}

async function postInvite(body: InviteBody) {
    const response = await createChannelInvite("user-id", "channel-id", body);
    assert(response.data && typeof response.data === "object", "invite route should return a response body");
    return response as { status: number; data: ReturnType<typeof toPlainInvite> & { inviter?: unknown; guild?: unknown; channel?: unknown } };
}

describe("createChannelInvite", () => {
    test("reuses a matching active invite when unique is omitted and does not emit INVITE_CREATE", async () => {
        const harness = installInviteRouteHarness();

        const first = await postInvite({});
        assert.equal(first.status, 201);
        assert.equal(harness.invites.length, 1);
        assert.equal(harness.emittedEvents.length, 1);

        const second = await postInvite({});
        assert.equal(second.status, 200);
        assert.equal(second.data.code, first.data.code);
        assert.equal(harness.invites.length, 1);
        assert.equal(harness.emittedEvents.length, 1);
    });

    test("creates a new invite when unique is true even if a reusable invite exists", async () => {
        const harness = installInviteRouteHarness();

        const first = await postInvite({});
        const second = await postInvite({ unique: true });

        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        assert.notEqual(second.data.code, first.data.code);
        assert.equal(harness.invites.length, 2);
        assert.equal(harness.emittedEvents.length, 2);
    });

    test("does not reuse expired or used-up matching invites", async () => {
        const expired = createStoredInvite({
            code: "expired",
            max_uses: 1,
            expires_at: new Date(Date.now() - 1000),
        });
        const usedUp = createStoredInvite({
            code: "used-up",
            max_uses: 1,
            uses: 1,
        });
        const harness = installInviteRouteHarness([expired, usedUp]);

        const response = await postInvite({ max_uses: 1 });

        assert.equal(response.status, 201);
        assert.notEqual(response.data.code, expired.code);
        assert.notEqual(response.data.code, usedUp.code);
        assert.equal(harness.invites.length, 3);
        assert.equal(harness.emittedEvents.length, 1);
    });

    test("does not reuse invites with different normalized create options", async () => {
        const existing = createStoredInvite({ code: "different-options", max_age: 86400 });
        const harness = installInviteRouteHarness([existing]);

        const response = await postInvite({ max_age: 120 });

        assert.equal(response.status, 201);
        assert.notEqual(response.data.code, existing.code);
        assert.equal(response.data.max_age, 120);
        assert.equal(harness.invites.length, 2);
        assert.equal(harness.emittedEvents.length, 1);
    });
});
