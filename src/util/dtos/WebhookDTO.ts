/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type { APIWebhook, PartialUser } from "@spacebar/schemas";
import type { Webhook } from "../entities";

type PartialUserSource = Pick<PartialUser, "id" | "username" | "discriminator"> & {
    avatar?: PartialUser["avatar"] | undefined;
} & Partial<Omit<PartialUser, "id" | "username" | "discriminator" | "avatar">>;

export interface ToAPIWebhookOptions {
    url?: string;
    user?: PartialUserSource | null;
}

const optionalPartialUserKeys = [
    "global_name",
    "avatar_decoration_data",
    "collectibles",
    "display_name_styles",
    "primary_guild",
    "bot",
    "system",
    "banner",
    "accent_color",
    "public_flags",
] as const satisfies readonly (keyof PartialUser)[];

export function toAPIPartialUser(user: PartialUserSource): PartialUser {
    const source = user as unknown as Record<string, unknown>;
    const partial: PartialUser = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar ?? null,
    };

    for (const key of optionalPartialUserKeys) {
        if (source[key] !== undefined) {
            (partial as unknown as Record<string, unknown>)[key] = source[key];
        }
    }

    return partial;
}

export function toAPIWebhook(webhook: Webhook, options: ToAPIWebhookOptions = {}): APIWebhook {
    const user = options.user === undefined ? webhook.user : options.user;
    const apiWebhook: APIWebhook = {
        id: webhook.id,
        type: webhook.type,
        guild_id: webhook.guild_id ?? webhook.guild?.id ?? null,
        channel_id: webhook.channel_id ?? webhook.channel?.id ?? null,
        user: user ? toAPIPartialUser(user) : (user ?? null),
        name: webhook.name ?? null,
        avatar: webhook.avatar ?? null,
        token: webhook.token ?? null,
        application_id: webhook.application_id ?? webhook.application?.id ?? null,
        source_guild_id: webhook.source_guild_id ?? webhook.source_guild?.id ?? null,
        source_channel_id: webhook.source_channel_id ?? webhook.source_channel?.id ?? null,
    };

    if (options.url !== undefined) {
        apiWebhook.url = options.url;
    }

    return apiWebhook;
}
