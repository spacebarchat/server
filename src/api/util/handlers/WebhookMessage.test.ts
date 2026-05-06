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
import { describe, it } from "node:test";
import { DiscordApiErrors, Webhook } from "@spacebar/util";
import { assertWebhookToken, getWebhookMessageWhere } from "./WebhookMessage";

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
});
