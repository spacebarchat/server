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

export const VoiceStateUpdateSchema = z.object({
    guild_id: z.string().optional(),
    channel_id: z.string().optional(),
    self_mute: z.boolean(),
    self_deaf: z.boolean(),
    self_video: z.boolean().optional(),
    preferred_region: z.string().optional(),
    request_to_speak_timestamp: z.iso.datetime().optional(),
    suppress: z.boolean().optional(),
    flags: z.number().optional(),
});

export type VoiceStateUpdateSchema = z.infer<typeof VoiceStateUpdateSchema>;
