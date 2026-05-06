/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { Attachment, Webhook } from "@spacebar/util";
import type * as MessageModule from "./Message";
import type * as WebhookMessageModule from "./WebhookMessage";

let DiscordApiErrors: (typeof import("@spacebar/util"))["DiscordApiErrors"];
let ChannelType: (typeof import("@spacebar/schemas"))["ChannelType"];
let assertWebhookToken: typeof WebhookMessageModule.assertWebhookToken;
let buildWebhookMessageEditBody: typeof WebhookMessageModule.buildWebhookMessageEditBody;
let getWebhookMessageWhere: typeof WebhookMessageModule.getWebhookMessageWhere;
let normalizeWebhookMessageEditBody: typeof WebhookMessageModule.normalizeWebhookMessageEditBody;
let resolveWebhookMessageEditAttachments: typeof WebhookMessageModule.resolveWebhookMessageEditAttachments;
let shouldDecrementWebhookMessageChannel: typeof WebhookMessageModule.shouldDecrementWebhookMessageChannel;
let uploadWebhookMessageFiles: typeof WebhookMessageModule.uploadWebhookMessageFiles;
let isMessageEditOperation: typeof MessageModule.isMessageEditOperation;

before(async () => {
    process.env.DATABASE ??= "postgres://user:pass@localhost:5432/test";

    ({ DiscordApiErrors } = require("@spacebar/util") as typeof import("@spacebar/util"));
    ({ ChannelType } = require("@spacebar/schemas") as typeof import("@spacebar/schemas"));
    ({
        assertWebhookToken,
        buildWebhookMessageEditBody,
        getWebhookMessageWhere,
        normalizeWebhookMessageEditBody,
        resolveWebhookMessageEditAttachments,
        shouldDecrementWebhookMessageChannel,
        uploadWebhookMessageFiles,
    } = await import("./WebhookMessage.js"));
    ({ isMessageEditOperation } = await import("./Message.js"));
});

function attachment(id: string): Attachment {
    return { id, filename: `${id}.txt` } as Attachment;
}

describe("WebhookMessage handlers", () => {
    it("accepts matching webhook tokens", () => {
        assert.doesNotThrow(() => assertWebhookToken({ token: "secret" } as Webhook, "secret"));
    });

    it("rejects missing webhooks as unknown webhooks", () => {
        assert.throws(() => assertWebhookToken(null, "secret"), {
            code: DiscordApiErrors.UNKNOWN_WEBHOOK.code,
            message: DiscordApiErrors.UNKNOWN_WEBHOOK.message,
        });
    });

    it("rejects mismatched webhook tokens", () => {
        assert.throws(() => assertWebhookToken({ token: "secret" } as Webhook, "wrong"), {
            code: DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED.code,
            message: DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED.message,
        });
    });

    it("scopes webhook message lookups to the webhook id", () => {
        assert.deepEqual(getWebhookMessageWhere("webhook", "message"), {
            id: "message",
            webhook_id: "webhook",
        });
    });

    it("scopes threaded webhook message lookups to the thread id", () => {
        assert.deepEqual(getWebhookMessageWhere("webhook", "message", "thread"), {
            id: "message",
            webhook_id: "webhook",
            channel_id: "thread",
        });
    });

    it("keeps existing attachments when webhook message edits omit attachments", () => {
        const existing = [attachment("keep"), attachment("also-keep")];
        const uploaded = [attachment("uploaded")];

        assert.deepEqual(resolveWebhookMessageEditAttachments(existing, undefined, uploaded), [...existing, ...uploaded]);
    });

    it("retains requested existing attachments and appends new multipart uploads", () => {
        const keep = attachment("keep");
        const remove = attachment("remove");
        const uploaded = attachment("uploaded");

        assert.deepEqual(
            resolveWebhookMessageEditAttachments(
                [keep, remove],
                [
                    { id: "keep", filename: "keep.txt" },
                    { id: "0", filename: "new-file-placeholder.txt" },
                ],
                [uploaded],
            ),
            [keep, uploaded],
        );
    });

    it("clears retained attachments when webhook message edits send null attachments", () => {
        assert.deepEqual(resolveWebhookMessageEditAttachments([attachment("remove")], null, []), []);
    });

    it("preserves cloud attachments for message edit processing", () => {
        const cloudAttachment = {
            id: "cloud",
            filename: "cloud.txt",
            uploaded_filename: "cloud-upload-key",
        };

        assert.deepEqual(resolveWebhookMessageEditAttachments([], [cloudAttachment], []), [cloudAttachment]);
    });

    it("uploads webhook files under the target channel and message path", async () => {
        const file = {
            buffer: Buffer.from("hello"),
            mimetype: "text/plain",
            originalname: "hello.txt",
        };
        const calls: { path: string; originalname: string }[] = [];

        const uploaded = await uploadWebhookMessageFiles("channel", "message", [file], async (path, uploadedFile) => {
            calls.push({ path, originalname: uploadedFile.originalname });
            return attachment("uploaded");
        });

        assert.deepEqual(calls, [{ path: "/attachments/channel/message", originalname: "hello.txt" }]);
        assert.equal(uploaded[0].id, "uploaded");
    });

    it("normalizes nullable webhook message edit fields before message processing", () => {
        assert.deepEqual(normalizeWebhookMessageEditBody({ allowed_mentions: null, components: null, content: null, embeds: null }), {
            components: [],
            content: "",
            embeds: [],
        });
    });

    it("marks edit operations so message processing can skip create-only side effects", () => {
        assert.equal(isMessageEditOperation({ is_edit: true }), true);
        assert.equal(isMessageEditOperation({ is_edit: false }), false);
        assert.equal(isMessageEditOperation({}), false);
    });

    it("builds webhook message edit bodies with retained and uploaded attachments", async () => {
        const existing = attachment("existing");

        const body = await buildWebhookMessageEditBody(
            { id: "message", channel_id: "channel", attachments: [existing] },
            { content: "edited" },
            [{ buffer: Buffer.from("new"), mimetype: "text/plain", originalname: "new.txt" }],
            async () => attachment("uploaded"),
        );

        assert.equal(body.content, "edited");
        assert.deepEqual(
            body.attachments?.map((current) => current.id),
            ["existing", "uploaded"],
        );
    });

    it("rejects edit body construction for messages without a channel", async () => {
        await assert.rejects(() => buildWebhookMessageEditBody({ id: "message", attachments: [] }, {}, []), {
            code: DiscordApiErrors.UNKNOWN_MESSAGE.code,
            message: DiscordApiErrors.UNKNOWN_MESSAGE.message,
        });
    });

    it("only decrements public thread counters during webhook message deletion", () => {
        assert.equal(shouldDecrementWebhookMessageChannel({ type: ChannelType.GUILD_PUBLIC_THREAD }), true);
        assert.equal(shouldDecrementWebhookMessageChannel({ type: ChannelType.GUILD_TEXT }), false);
        assert.equal(shouldDecrementWebhookMessageChannel(undefined), false);
    });
});
