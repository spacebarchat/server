import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CloseSessionCleanupDependencies, CloseSessionRecord } from "./Close";

async function loadCloseCleanup() {
    process.env.DATABASE ??= "postgres://spacebar:spacebar@127.0.0.1/spacebar";
    return await import("./Close.js");
}

function createSession(lastSeen: Date): CloseSessionRecord {
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
        const updates: { userId: string; sessionId: string }[] = [];
        const presenceEvents: unknown[] = [];
        const deps: CloseSessionCleanupDependencies = {
            async findSession(userId, sessionId) {
                assert.equal(userId, "user");
                assert.equal(sessionId, "auth-session");
                return session;
            },
            async findSessions() {
                return [session];
            },
            async markSessionOffline(userId, sessionId) {
                updates.push({ userId, sessionId });
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
        assert.deepEqual(updates, [{ userId: "user", sessionId: "auth-session" }]);
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

    test("does not mark reactivated sessions offline", async () => {
        const { cleanupClosedSessionPresence } = await loadCloseCleanup();
        const session = createSession(new Date(3000));
        let updateCount = 0;
        let eventCount = 0;
        let sessionsReplaceCount = 0;
        const deps: CloseSessionCleanupDependencies = {
            async findSession() {
                return session;
            },
            async findSessions() {
                return [session];
            },
            async markSessionOffline() {
                updateCount++;
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
        assert.equal(updateCount, 0);
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
            async findSession() {
                return closedSession;
            },
            async findSessions() {
                return [closedSession, activeSession];
            },
            async markSessionOffline() {},
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
});
