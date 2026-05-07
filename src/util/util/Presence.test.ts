import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Session } from "../entities/Session";
import type { Activity, Status } from "../interfaces";

function createActivity(name: string): Activity {
    return { name, type: 0, flags: "0", session_id: "session" };
}

function createSession(status: Status, activities: Activity[] = []): Session {
    return { status, activities } as Session;
}

describe("getMostRelevantSession", () => {
    test("prioritizes status before activity count", async () => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@127.0.0.1/spacebar";
        const { getMostRelevantSession } = await import("./Presence.js");
        const offline = createSession("offline", []);
        const idle = createSession("idle", [createActivity("game"), createActivity("music")]);
        const dnd = createSession("dnd", [createActivity("game"), createActivity("music")]);

        assert.equal(getMostRelevantSession([offline, idle]), idle);
        assert.equal(getMostRelevantSession([offline, dnd]), dnd);
    });
});
