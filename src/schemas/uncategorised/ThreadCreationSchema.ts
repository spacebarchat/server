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
import { MessageCreateAttachment, MessageCreateCloudAttachment } from "./MessageCreateSchema";

export const ThreadCreationSchema = z.object({
    auto_archive_duration: z.number().optional(),
    rate_limit_per_user: z.number().optional(),
    name: z.string(),
    type: z.number().optional(),
    invitable: z.boolean().optional(),
    applied_tags: z.array(z.string()).optional(),
    location: z.string().optional(),
    message: z
        .object({
            content: z.string(),
            embeds: z.array(z.any()),
            allowed_mentions: z
                .object({
                    parse: z.array(z.string()),
                    roles: z.array(z.string()),
                    users: z.array(z.string()),
                    replied_user: z.boolean(),
                })
                .partial(),
            components: z.array(z.any()).nullable(),
            sticker_ids: z.array(z.string()),
            activity: z.any(),
            application_id: z.string(),
            flags: z.number(),
            attachments: z.array(z.union([MessageCreateAttachment, MessageCreateCloudAttachment])),
        })
        .partial(),
});

export type ThreadCreationSchema = z.infer<typeof ThreadCreationSchema>;
