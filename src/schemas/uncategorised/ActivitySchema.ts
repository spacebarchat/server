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

import { Activity, Status } from "@spacebar/util";

export const ActivitySchema = {
    $afk: Boolean,
    status: String,
    $activities: [
        {
            name: String,
            type: Number,
            $url: String,
            $created_at: Date,
            $timestamps: {
                $start: Number,
                $end: Number,
            },
            $application_id: String,
            $details: String,
            $state: String,
            $emoji: {
                $name: String,
                $id: String,
                $animated: Boolean,
            },
            $party: {
                $id: String,
                $size: [Number, Number],
            },
            $assets: {
                $large_image: String,
                $large_text: String,
                $small_image: String,
                $small_text: String,
            },
            $secrets: {
                $join: String,
                $spectate: String,
                $match: String,
            },
            $instance: Boolean,
            $flags: String,

            // Spotify and other rich presence data
            $id: String,
            $sync_id: String,
            $metadata: {
                // spotify
                $context_uri: String,
                album_id: String,
                artist_ids: [String],
            },
            $session_id: String,
        },
    ],
    $since: Number, // unix time (in milliseconds) of when the client went idle, or null if the client is not idle
};

export interface ActivitySchema {
    afk?: boolean;
    status: Status;
    activities?: Activity[];
    since?: number; // unix time (in milliseconds) of when the client went idle, or null if the client is not idle
}
