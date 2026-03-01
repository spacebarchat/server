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
import { ChannelType } from "@spacebar/schemas";

const PermissionOverwriteSchema = z.object({
    id: z.string(),
    type: z.number(),
    allow: z.string(),
    deny: z.string(),
});

const TagCreateBaseSchema = z.object({
    name: z.string(),
    moderated: z.boolean().optional(),
    emoji_id: z.string().nullish(),
    emoji_name: z.string().nullish(),
});

export const ChannelModifySchema = z
    .object({
        name: z.string(),
        type: z.enum(ChannelType),
        topic: z.string(),
        icon: z.string().nullable(),
        bitrate: z.number(),
        user_limit: z.number(),
        rate_limit_per_user: z.number(),
        position: z.number(),
        invitable: z.boolean(),
        permission_overwrites: z.array(PermissionOverwriteSchema),
        applied_tags: z.array(z.string()),
        parent_id: z.string(),
        id: z.string(),
        nsfw: z.boolean(),
        rtc_region: z.string(),
        default_auto_archive_duration: z.number(),
        default_reaction_emoji: z.string().nullable(),
        flags: z.number(),
        default_thread_rate_limit_per_user: z.number(),
        video_quality_mode: z.number(),
        auto_archive_duration: z.number(),
        archived: z.boolean(),
        locked: z.boolean(),
        available_tags: z.array(TagCreateBaseSchema.extend({ id: z.string() })),
    })
    .partial();

export type ChannelModifySchema = z.infer<typeof ChannelModifySchema>;
