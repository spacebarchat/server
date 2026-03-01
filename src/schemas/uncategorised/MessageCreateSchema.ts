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

export const MessageCreateAttachment = z.object({
    id: z.string(),
    filename: z.string(),
});

export const MessageCreateCloudAttachment = z.object({
    id: z.string().optional(),
    filename: z.string(),
    uploaded_filename: z.string(),
    original_content_type: z.string().optional(),
});

const AllowedMentionsSchema = z
    .object({
        parse: z.array(z.string()),
        roles: z.array(z.string()),
        users: z.array(z.string()),
        replied_user: z.boolean(),
    })
    .partial();

const MessageReferenceSchema = z
    .object({
        message_id: z.string(),
        channel_id: z.string(),
        guild_id: z.string(),
        fail_if_not_exists: z.boolean(),
        type: z.number(),
    })
    .partial();

export const PollCreationSchema = z.object({
    question: z.object({ text: z.string().optional() }),
    answers: z.array(z.object({ poll_media: z.object({ text: z.string().optional(), emoji: z.any().optional() }) })),
    duration: z.number().optional(),
    allow_multiselect: z.boolean().optional(),
    layout_type: z.number().optional(),
});

export const MessageCreateSchema = z
    .object({
        type: z.number(),
        content: z.string(),
        mobile_network_type: z.string(),
        nonce: z.string(),
        channel_id: z.string(),
        tts: z.boolean(),
        flags: z.number(),
        embeds: z.array(z.any()).nullable(),
        embed: z.any().nullable(),
        allowed_mentions: AllowedMentionsSchema,
        message_reference: MessageReferenceSchema,
        payload_json: z.string(),
        file: z.object({ filename: z.string() }),
        attachments: z.array(z.union([MessageCreateAttachment, MessageCreateCloudAttachment])),
        sticker_ids: z.array(z.string()).nullable(),
        components: z.array(z.any()).nullable(),
        poll: PollCreationSchema,
        enforce_nonce: z.boolean(),
        applied_tags: z.array(z.string()),
        thread_name: z.string(),
        avatar_url: z.string(),
        interaction: z.any(),
        interaction_metadata: z.any(),
    })
    .partial();

export type MessageCreateSchema = z.infer<typeof MessageCreateSchema>;
export type PollCreationSchema = z.infer<typeof PollCreationSchema>;
export type MessageCreateAttachment = z.infer<typeof MessageCreateAttachment>;
export type MessageCreateCloudAttachment = z.infer<typeof MessageCreateCloudAttachment>;
