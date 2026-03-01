/*
    Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
    Copyright (C) 2023 Spacebar and Spacebar Contributors

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

import { z } from "zod";
import { MessageCreateAttachment, MessageCreateCloudAttachment, PollCreationSchema } from "./MessageCreateSchema";

export const WebhookExecuteSchema = z
    .object({
        content: z.string(),
        username: z.string(),
        avatar_url: z.string(),
        tts: z.boolean(),
        embeds: z.array(z.record(z.string(), z.any())),
        allowed_mentions: z
            .object({
                parse: z.array(z.string()),
                roles: z.array(z.string()),
                users: z.array(z.string()),
                replied_user: z.boolean(),
            })
            .partial(),
        components: z.array(z.record(z.string(), z.any())),
        file: z.object({ filename: z.string() }),
        payload_json: z.string(),
        attachments: z.array(MessageCreateAttachment),
        flags: z.number(),
        thread_name: z.string(),
        applied_tags: z.array(z.string()),
        message_reference: z
            .object({
                message_id: z.string(),
                channel_id: z.string(),
                guild_id: z.string(),
                fail_if_not_exists: z.boolean(),
            })
            .partial({
                channel_id: true,
                guild_id: true,
                fail_if_not_exists: true,
            }),
        sticker_ids: z.array(z.string()),
        nonce: z.string(),
        enforce_nonce: z.boolean(),
        poll: PollCreationSchema,
    })
    .partial();

export type WebhookExecuteSchema = z.infer<typeof WebhookExecuteSchema>;
