import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ApplicationCommandCreateSchema } from "../../../schemas/api/bots/ApplicationCommandCreateSchema";
import { ApplicationCommandType } from "../../../schemas/api/bots/ApplicationCommandSchema";
import { FieldError } from "../../../util/util/FieldError";
import { Snowflake } from "../../../util/util/Snowflake";
import { FindOperator } from "typeorm";
import {
    applicationCommandIdWhere,
    applicationCommandNameWhere,
    applicationCommandScopeWhere,
    buildApplicationCommand,
    normalizeApplicationCommandName,
} from "./ApplicationCommands";

function assertIsNullOperator(value: unknown) {
    assert.equal(value instanceof FindOperator, true);
    assert.equal((value as FindOperator<unknown>).type, "isNull");
}

describe("application command helpers", () => {
    test("scopes global command predicates to null guild ids", () => {
        const scopeWhere = applicationCommandScopeWhere({ applicationId: "app" });
        assert.equal(scopeWhere.application_id, "app");
        assertIsNullOperator(scopeWhere.guild_id);

        const nameWhere = applicationCommandNameWhere({ applicationId: "app" }, "ping");
        assert.equal(nameWhere.application_id, "app");
        assert.equal(nameWhere.name, "ping");
        assertIsNullOperator(nameWhere.guild_id);

        const idWhere = applicationCommandIdWhere({ applicationId: "app" }, "command");
        assert.equal(idWhere.application_id, "app");
        assert.equal(idWhere.id, "command");
        assertIsNullOperator(idWhere.guild_id);
    });

    test("scopes guild command predicates to the requested guild", () => {
        assert.deepEqual(applicationCommandNameWhere({ applicationId: "app", guildId: "guild" }, "ping"), {
            application_id: "app",
            guild_id: "guild",
            name: "ping",
        });

        assert.deepEqual(applicationCommandIdWhere({ applicationId: "app", guildId: "guild" }, "command"), {
            application_id: "app",
            guild_id: "guild",
            id: "command",
        });
    });

    test("builds normalized command records", (t) => {
        t.mock.method(Snowflake, "generate", () => "version");

        const body: ApplicationCommandCreateSchema = {
            name: " ping ",
            description: " pong ",
        };
        const command = buildApplicationCommand({ applicationId: "app", guildId: "guild" }, body);

        assert.equal(command.application_id, "app");
        assert.equal(command.guild_id, "guild");
        assert.equal(command.name, "ping");
        assert.equal(command.description, "pong");
        assert.equal(command.type, ApplicationCommandType.CHAT_INPUT);
        assert.equal(command.version, "version");
        assert.equal(body.type, ApplicationCommandType.CHAT_INPUT);
    });

    test("rejects empty and oversized command names", () => {
        assert.throws(() => normalizeApplicationCommandName(" "), FieldError);
        assert.throws(() => normalizeApplicationCommandName("a".repeat(33)), FieldError);
    });
});
