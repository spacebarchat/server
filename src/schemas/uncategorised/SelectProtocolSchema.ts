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

export const SelectProtocolSchema = z.object({
    protocol: z.enum(["webrtc", "udp"]),
    data: z.union([
        z.string(),
        z.object({
            address: z.string(),
            port: z.number(),
            mode: z.string(),
        }),
    ]),
    sdp: z.string().optional(),
    codecs: z
        .array(
            z.object({
                name: z.enum(["opus", "VP8", "VP9", "H264"]),
                type: z.enum(["audio", "video"]),
                priority: z.number(),
                payload_type: z.number(),
                rtx_payload_type: z.number().optional(),
            }),
        )
        .optional(),
    rtc_connection_id: z.string().optional(),
});

export type SelectProtocolSchema = z.infer<typeof SelectProtocolSchema>;
