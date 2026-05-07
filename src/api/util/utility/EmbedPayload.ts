/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const embedBearingRequestSchemas = new Set(["MessageCreateSchema", "MessageEditSchema", "WebhookExecuteSchema", "ThreadCreationSchema", "InteractionCallbacksSchema"]);

const nullishOptionalFooterKeys = ["icon_url", "proxy_icon_url"] as const;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeEmbedFooter(embed: UnknownRecord) {
    const { footer } = embed;
    if (!isRecord(footer)) return;

    for (const key of nullishOptionalFooterKeys) {
        if (footer[key] === null || footer[key] === undefined) {
            delete footer[key];
        }
    }

    if (Object.keys(footer).length === 0) {
        delete embed.footer;
    }
}

function normalizeEmbedContainer(container: UnknownRecord) {
    if (isRecord(container.embed)) {
        normalizeEmbedFooter(container.embed);
    }

    if (!Array.isArray(container.embeds)) return;

    for (const embed of container.embeds) {
        if (isRecord(embed)) {
            normalizeEmbedFooter(embed);
        }
    }
}

export function normalizeEmbedPayload(payload: unknown, seen = new WeakSet<object>()) {
    if (!payload || typeof payload !== "object") return;
    if (seen.has(payload)) return;

    seen.add(payload);

    if (Array.isArray(payload)) {
        for (const item of payload) {
            normalizeEmbedPayload(item, seen);
        }
        return;
    }

    normalizeEmbedContainer(payload as UnknownRecord);

    for (const value of Object.values(payload)) {
        normalizeEmbedPayload(value, seen);
    }
}

export function normalizeEmbedPayloadForSchema(schemaName: string, payload: unknown) {
    if (embedBearingRequestSchemas.has(schemaName)) {
        normalizeEmbedPayload(payload);
    }
}
