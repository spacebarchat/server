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

export interface VoiceVideoSchema {
    audio_ssrc: number;
    video_ssrc: number;
    rtx_ssrc?: number;
    user_id?: string;
    streams?: {
        type: "video" | "audio" | "screen";
        rid: string;
        ssrc: number;
        active: boolean;
        quality: number;
        rtx_ssrc: number;
        max_bitrate: number;
        max_framerate: number;
        max_resolution: { type: string; width: number; height: number };
    }[];
}
