import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CloseSessionCleanupDependencies, CloseSessionRecord } from "./Close";

type Activity = CloseSessionRecord["activities"][number];

async function loadCloseCleanup() {
    process.env.DATABASE ??= "postgres://spacebar:spacebar@127.0.0.1/spacebar";
    return await import("./Close.js");
}

function createActivity(name: string): Activity {
    return { name, type: 0, flags: "0", session_id: "session" };
}

function createSession(lastSeen: Date, overrides: Partial<CloseSessionRecord> = {}): CloseSessionRecord {
    return {
        last_seen: lastSeen,
        activities: [],
        client_status: { web: "online" },
        status: "online",
        getPublicStatus() {
            return this.status;
        },
        toPrivateGatewayDeviceInfo() {
            return {
                session_id: "session",
                client_info: { client: "web", os: "browser", version: 1 },
                status: this.status,
                activities: this.activities,
                hidden_activities: [],
                active: this.status !== "offline",
            };
        },
        ...overrides,
    };
}

function publicUser(id = "user") {
    return {
        id,
        username: "user",
        discriminator: "0001",
        avatar: undefined,
        accent_color: undefined,
        public_flags: 0,
        bot: false,
        premium_since: undefined,
        premium_type: 0,
        banner: undefined,
        bio: "",
        theme_colors: undefined,
        pronouns: "",
        badge_ids: [],
        avatar_decoration_data: undefined,
        display_name_styles: undefined,
        collectibles: undefined,
        primary_guild: undefined,
    };
}

describe("cleanupClosedSessionPresence", () => {
    test("marks the authenticated session offline and distributes offline presence", async () => {
        const { cleanupClosedSessionPresence } = await loadCloseCleanup();
        const session = createSession(new Date(1000));
        const sessionReplaceEvents: unknown[] = [];
        const updates: { userId: string; sessionId: string; closedAt: number }[] = [];
        const presenceEvents: unknown[] = [];
        const deps: CloseSessionCleanupDependencies = {
            async findSessions() {
                return [session];
            },
            async markSessionOffline(userId, sessionId, closedAt) {
                updates.push({ userId, sessionId, closedAt });
                session.status = "offline";
                session.activities = [];
                session.client_status = {};
                return true;
            },
            async findPublicUser(userId) {
                return publicUser(userId);
            },
            async emitSessionsReplace(userId, sessions) {
                sessionReplaceEvents.push({ userId, sessions: sessions.map((x) => x.toPrivateGatewayDeviceInfo()) });
            },
            async distributePresenceUpdate(userId, event) {
                assert.equal(userId, "user");
                presenceEvents.push(event);
            },
            getMostRelevantSession(sessions) {
                return sessions[0];
            },
            createTransactionId(userId) {
                return `tx-${userId}`;
            },
        };

        const updated = await cleanupClosedSessionPresence("user", "auth-session", 2000, deps);

        assert.equal(updated, true);
        assert.deepEqual(updates, [{ userId: "user", sessionId: "auth-session", closedAt: 2000 }]);
        assert.equal(session.status, "offline");
        assert.deepEqual(session.activities, []);
        assert.deepEqual(session.client_status, {});
        assert.deepEqual(sessionReplaceEvents, [
            {
                userId: "user",
                sessions: [session.toPrivateGatewayDeviceInfo()],
            },
        ]);
        assert.deepEqual(presenceEvents, [
            {
                event: "PRESENCE_UPDATE",
                data: {
                    user: publicUser("user"),
                    status: "offline",
                    client_status: {},
                    activities: [],
                },
                origin: "GATEWAY_CLOSE",
                transaction_id: "tx-user",
            },
        ]);
    });

    test("does not emit when the conditional offline update loses to a reactivated session", async () => {
        const { cleanupClosedSessionPresence } = await loadCloseCleanup();
        const session = createSession(new Date(3000));
        let updateCount = 0;
        let eventCount = 0;
        let sessionsReplaceCount = 0;
        const deps: CloseSessionCleanupDependencies = {
            async findSessions() {
                throw new Error("sessions should not be queried after a stale cleanup update");
            },
            async markSessionOffline() {
                updateCount++;
                return false;
            },
            async findPublicUser() {
                return publicUser();
            },
            async emitSessionsReplace() {
                sessionsReplaceCount++;
            },
            async distributePresenceUpdate() {
                eventCount++;
            },
            getMostRelevantSession(sessions) {
                return sessions[0];
            },
            createTransactionId() {
                return "tx";
            },
        };

        const updated = await cleanupClosedSessionPresence("user", "auth-session", 2000, deps);

        assert.equal(updated, false);
        assert.equal(updateCount, 1);
        assert.equal(eventCount, 0);
        assert.equal(sessionsReplaceCount, 0);
        assert.equal(session.status, "online");
    });

    test("keeps aggregate presence online when another session remains online", async () => {
        const { cleanupClosedSessionPresence } = await loadCloseCleanup();
        const closedSession = createSession(new Date(1000));
        const activeSession = createSession(new Date(2500));
        activeSession.client_status = { desktop: "online" };
        const presenceEvents: unknown[] = [];
        const deps: CloseSessionCleanupDependencies = {
            async findSessions() {
                return [closedSession, activeSession];
            },
            async markSessionOffline() {
                closedSession.status = "offline";
                closedSession.activities = [];
                closedSession.client_status = {};
                return true;
            },
            async findPublicUser(userId) {
                return publicUser(userId);
            },
            async emitSessionsReplace() {},
            async distributePresenceUpdate(_userId, event) {
                presenceEvents.push(event);
            },
            getMostRelevantSession() {
                return activeSession;
            },
            createTransactionId() {
                return "tx";
            },
        };

        const updated = await cleanupClosedSessionPresence("user", "auth-session", 2000, deps);

        assert.equal(updated, true);
        assert.deepEqual(presenceEvents, [
            {
                event: "PRESENCE_UPDATE",
                data: {
                    user: publicUser("user"),
                    status: "online",
                    client_status: { desktop: "online" },
                    activities: [],
                },
                origin: "GATEWAY_CLOSE",
                transaction_id: "tx",
            },
        ]);
    });

    test("uses status-safe relevance when retained offline sessions have fewer activities", async () => {
        const [{ cleanupClosedSessionPresence }, { getMostRelevantSession }] = await Promise.all([loadCloseCleanup(), import("../../util/util/Presence.js")]);
        const closedSession = createSession(new Date(1000), {
            status: "online",
            client_status: { web: "online" },
            activities: [],
        });
        const idleSession = createSession(new Date(2500), {
            status: "idle",
            client_status: { desktop: "idle" },
            activities: [createActivity("game"), createActivity("music")],
        });
        const presenceEvents: unknown[] = [];
        const deps: CloseSessionCleanupDependencies = {
            async findSessions() {
                return [closedSession, idleSession];
            },
            async markSessionOffline() {
                closedSession.status = "offline";
                closedSession.activities = [];
                closedSession.client_status = {};
                return true;
            },
            async findPublicUser(userId) {
                return publicUser(userId);
            },
            async emitSessionsReplace() {},
            async distributePresenceUpdate(_userId, event) {
                presenceEvents.push(event);
            },
            getMostRelevantSession(sessions) {
                return getMostRelevantSession(sessions as Parameters<typeof getMostRelevantSession>[0]) as CloseSessionRecord | undefined;
            },
            createTransactionId() {
                return "tx";
            },
        };

        const updated = await cleanupClosedSessionPresence("user", "auth-session", 2000, deps);

        assert.equal(updated, true);
        assert.deepEqual(presenceEvents, [
            {
                event: "PRESENCE_UPDATE",
                data: {
                    user: publicUser("user"),
                    status: "idle",
                    client_status: { desktop: "idle" },
                    activities: [createActivity("game"), createActivity("music")],
                },
                origin: "GATEWAY_CLOSE",
                transaction_id: "tx",
            },
        ]);
    });
});
