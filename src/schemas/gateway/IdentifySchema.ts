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
import { ActivitySchema } from "../uncategorised/ActivitySchema";

export const IdentifySchema = z.object({
    token: z.string(),
    properties: z.object({
        os: z.string().optional(),
        $os: z.string().optional(),
        browser: z.string().optional(),
        $browser: z.string().optional(),
        device: z.string().optional(),
        $device: z.string().optional(),
        system_locale: z.string().optional(),
        client_version: z.string().optional(),
        client_build_number: z.number().optional(),
        release_channel: z.string().optional()
    }),
    compress: z.boolean().optional(),
    large_threshold: z.number().optional(),
    largeThreshold: z.number().optional(),
    shard: z.tuple([z.coerce.bigint(), z.coerce.bigint()]).optional(),
    presence: ActivitySchema.optional(),
    intents: z.coerce.bigint().optional(),
    capabilities: z.number().optional(),
    client_state: z.object({
        guild_hashes: z.any().optional(),
        highest_last_message_id: z.number().optional(),
        read_state_version: z.number().optional(),
        user_guild_settings_version: z.number().optional(),
        user_settings_version: z.number().optional(),
        useruser_guild_settings_version: z.number().optional(),
        private_channels_version: z.number().optional(),
        guild_versions: z.any().optional(),
        api_code_version: z.number().optional(),
        initial_guild_id: z.string().optional(),
    }).optional(),
    v: z.number().optional(),
});

export type IdentifySchema = z.infer<typeof IdentifySchema>;
