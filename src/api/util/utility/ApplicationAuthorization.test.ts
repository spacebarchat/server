import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { TeamMemberRole, TeamMemberState } from "../../../schemas/api/developers/Team";
import { DiscordApiErrors } from "../../../util/util/Constants";
import { canManageApplicationCommands, requireApplicationCommandManagement } from "./ApplicationAuthorization";

describe("application command authorization", () => {
    test("allows the application owner", () => {
        assert.equal(canManageApplicationCommands({ owner: { id: "owner" } }, "owner"), true);
    });

    test("allows the application's bot user", () => {
        assert.equal(
            canManageApplicationCommands(
                {
                    owner: { id: "owner" },
                    bot: { id: "application" },
                },
                "application",
            ),
            true,
        );
    });

    test("allows accepted team admins and developers", () => {
        for (const role of [TeamMemberRole.ADMIN, TeamMemberRole.DEVELOPER]) {
            assert.equal(
                canManageApplicationCommands(
                    {
                        owner: { id: "owner" },
                        team: {
                            members: [
                                {
                                    user_id: "member",
                                    membership_state: TeamMemberState.ACCEPTED,
                                    role,
                                },
                            ],
                        },
                    },
                    "member",
                ),
                true,
            );
        }
    });

    test("allows the team owner", () => {
        assert.equal(
            canManageApplicationCommands(
                {
                    owner: { id: "owner" },
                    team: {
                        owner_user_id: "team-owner",
                        members: [],
                    },
                },
                "team-owner",
            ),
            true,
        );
    });

    test("rejects non-members, invited members, and read-only members", () => {
        const application = {
            owner: { id: "owner" },
            team: {
                members: [
                    {
                        user_id: "invited",
                        membership_state: TeamMemberState.INVITED,
                        role: TeamMemberRole.ADMIN,
                    },
                    {
                        user_id: "read-only",
                        membership_state: TeamMemberState.ACCEPTED,
                        role: TeamMemberRole.READ_ONLY,
                    },
                ],
            },
        };

        assert.equal(canManageApplicationCommands(application, "stranger"), false);
        assert.equal(canManageApplicationCommands(application, "invited"), false);
        assert.equal(canManageApplicationCommands(application, "read-only"), false);
    });

    test("loads owner and team members before allowing access", async (t) => {
        const repository = {
            findOne: t.mock.fn(async (_options: unknown) => ({
                owner: { id: "owner" },
                team: {
                    members: [
                        {
                            user_id: "developer",
                            membership_state: TeamMemberState.ACCEPTED,
                            role: TeamMemberRole.DEVELOPER,
                        },
                    ],
                },
            })),
        };

        await requireApplicationCommandManagement("app", "developer", repository);

        assert.deepEqual(repository.findOne.mock.calls[0].arguments[0], {
            where: { id: "app" },
            relations: {
                owner: true,
                bot: true,
                team: {
                    members: true,
                },
            },
        });
    });

    test("loads the application bot before allowing bot-token access", async (t) => {
        const repository = {
            findOne: t.mock.fn(async (_options: unknown) => ({
                owner: { id: "owner" },
                bot: { id: "app" },
            })),
        };

        await requireApplicationCommandManagement("app", "app", repository);

        assert.deepEqual(repository.findOne.mock.calls[0].arguments[0], {
            where: { id: "app" },
            relations: {
                owner: true,
                bot: true,
                team: {
                    members: true,
                },
            },
        });
    });

    test("throws the application authorization error for unauthorized callers", async (t) => {
        const repository = {
            findOne: t.mock.fn(async (_options: unknown) => ({ owner: { id: "owner" } })),
        };

        await assert.rejects(
            () => requireApplicationCommandManagement("app", "attacker", repository),
            (error) => error === DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION,
        );
    });

    test("does not infer bot access from matching application and user ids without the bot relation", async (t) => {
        const repository = {
            findOne: t.mock.fn(async (_options: unknown) => ({ owner: { id: "owner" } })),
        };

        await assert.rejects(
            () => requireApplicationCommandManagement("app", "app", repository),
            (error) => error === DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION,
        );
    });

    test("throws the unknown application error for missing applications", async (t) => {
        const repository = {
            findOne: t.mock.fn(async (_options: unknown) => null),
        };

        await assert.rejects(
            () => requireApplicationCommandManagement("missing-app", "user", repository),
            (error) => error === DiscordApiErrors.UNKNOWN_APPLICATION,
        );
    });
});
