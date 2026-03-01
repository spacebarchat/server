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

export const VoiceVideoSchema = z.object({
    audio_ssrc: z.number(),
    video_ssrc: z.number(),
    rtx_ssrc: z.number().optional(),
    user_id: z.string().optional(),
    streams: z
        .array(
            z.object({
                type: z.enum(["video", "audio", "screen"]),
                rid: z.string(),
                ssrc: z.number(),
                active: z.boolean(),
                quality: z.number(),
                rtx_ssrc: z.number(),
                max_bitrate: z.number(),
                max_framerate: z.number(),
                max_resolution: z.object({
                    type: z.string(),
                    width: z.number(),
                    height: z.number(),
                }),
            }),
        )
        .optional(),
});

export type VoiceVideoSchema = z.infer<typeof VoiceVideoSchema>;
