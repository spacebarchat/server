/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { base64str, float, PartialUser } from "@spacebar/schemas";

export interface PublicAttachment {
    filename: string;
    size: number;
    content_type?: string;
    url: string;
    proxy_url: string; // only relevant for images/video, but returns a 415 Unsupported Media Type for others, always included
    description?: string; // alt text
    flags?: AttachmentFlags;

    // image metadata
    height?: number;
    width?: number;

    // content scanning
    content_scan_version?: number;

    // thumbhash - https://github.com/evanw/thumbhash
    placeholder_version?: number;
    placeholder?: string;

    // voice messages
    duration_secs?: float;
    waveform?: base64str; // base64 byte array

    // clips
    title?: string; // clips only? Documentation kinda sucks...
    clip_created_at?: Date;
    clip_participants?: PartialUser[];
    // application?: PartialApplication[];
}

export enum AttachmentFlags {
    IS_CLIP = 1 << 0,
    IS_THUMBNAIL = 1 << 1,
    IS_REMIX = 1 << 2,
    IS_SPOILER = 1 << 3,
    CONTAINS_EXPLICIT_MEDIA = 1 << 4,
    IS_ANIMATED = 1 << 5,
    CONTAINS_GORE_CONTENT = 1 << 6,
    CONTAINS_SELF_HARM_CONTENT = 1 << 7,
}
