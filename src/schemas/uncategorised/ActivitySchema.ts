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
import { Status } from "@spacebar/util";

const BaseActivitySchema = z.object({
    name: z.string(),
    type: z.number(),
    url: z.string().nullish(),
    created_at: z.number().optional(),
    timestamps: z
        .object({
            start: z.number().optional(),
            end: z.number().optional(),
        })
        .optional(),
    application_id: z.string().optional(),
    details: z.string().nullish(),
    state: z.string().nullish(),
    emoji: z
        .object({
            name: z.string().optional(),
            id: z.string().optional(),
            animated: z.boolean().optional(),
        })
        .nullish(),
    party: z
        .object({
            id: z.string().optional(),
            size: z.array(z.number()).length(2).optional(),
        })
        .optional(),
    assets: z
        .object({
            large_image: z.string().optional(),
            large_text: z.string().optional(),
            small_image: z.string().optional(),
            small_text: z.string().optional(),
        })
        .optional(),
    secrets: z
        .object({
            join: z.string().optional(),
            spectate: z.string().optional(),
            match: z.string().optional(),
        })
        .optional(),
    instance: z.boolean().optional(),
    id: z.string().optional(),
    sync_id: z.string().optional(),
    metadata: z
        .object({
            context_uri: z.string().optional(),
            album_id: z.string().optional(),
            artist_ids: z.array(z.string()).optional(),
        })
        .optional(),
    session_id: z.string().nullish(),
});

const OldActivitySchema = BaseActivitySchema.extend({
    flags: z.string().optional(),
}).passthrough();

const NewActivitySchema = BaseActivitySchema.extend({
    flags: z.number().optional(),
    platform: z.string().optional(),
    supported_platforms: z.array(z.string()).optional(),
    parent_application_id: z.string().optional(),
    status_display_type: z.number().nullish(),
    details_url: z.string().nullish(),
    state_url: z.string().nullish(),
    buttons: z.array(z.string()).max(2).optional(),
}).passthrough();

export const ActivitySchema = z.object({
    afk: z.boolean().optional(),
    status: z.string(),
    activities: z.array(z.union([OldActivitySchema, NewActivitySchema])).optional(),
    since: z.number().nullish(),
});

export type ActivitySchema = z.infer<typeof ActivitySchema>;
