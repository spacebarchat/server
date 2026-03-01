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

export const VoiceIdentifySchema = z.object({
    server_id: z.string(),
    user_id: z.string(),
    session_id: z.string(),
    channel_id: z.string().optional(),
    token: z.string(),
    video: z.boolean().optional(),
    streams: z
        .array(
            z.object({
                type: z.enum(["video", "audio", "screen"]),
                rid: z.string(),
                quality: z.number(),
            }),
        )
        .optional(),
    max_secure_frames_version: z.number().optional(),
    max_dave_protocol_version: z.number().optional(),
});

export type VoiceIdentifySchema = z.infer<typeof VoiceIdentifySchema>;
