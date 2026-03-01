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
import { GuildCreateSchema } from "./GuildCreateSchema";

export const GuildUpdateSchema = GuildCreateSchema.omit({ channels: true }).extend({
    banner: z.string().nullish(),
    splash: z.string().nullish(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    verification_level: z.number().optional(),
    default_message_notifications: z.number().optional(),
    system_channel_flags: z.number().optional(),
    explicit_content_filter: z.number().optional(),
    public_updates_channel_id: z.string().optional(),
    afk_timeout: z.number().optional(),
    afk_channel_id: z.string().optional(),
    preferred_locale: z.string().optional(),
    premium_progress_bar_enabled: z.boolean().optional(),
    discovery_splash: z.string().optional(),
    safety_alerts_channel_id: z.string().nullish(),
});

export type GuildUpdateSchema = z.infer<typeof GuildUpdateSchema>;
