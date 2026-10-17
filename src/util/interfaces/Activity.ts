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

export interface Activity {
    name: string; // the activity's name
    type: ActivityType; // activity type // TODO: check if its between range 0-5
    url?: string; // stream url, is validated when type is 1
    created_at?: number; // unix timestamp of when the activity was added to the user's session
    timestamps?: {
        // unix timestamps for start and/or end of the game
        start?: number;
        end?: number;
    };
    application_id?: string; // application id for the game
    details?: string;
    details_url?: string;
    state?: string;
    status_display_type?: ActivityStatusDisplayType | null;
    emoji?: {
        name: string;
        id?: string;
        animated: boolean;
    } | null;
    party?: {
        id?: string;
        size?: number[]; // used to show the party's current and maximum size // TODO: array length 2
    };
    assets?: {
        large_image?: string; // the id for a large asset of the activity, usually a snowflake
        large_text?: string; // text displayed when hovering over the large image of the activity
        large_url?: string;
        small_image?: string; // the id for a small asset of the activity, usually a snowflake
        small_text?: string; // text displayed when hovering over the small image of the activity
        small_url?: string;
        invite_cover_image?: string;
    };
    secrets?: {
        join?: string; // the secret for joining a party
        spectate?: string; // the secret for spectating a game
        match?: string; // the secret for a specific instanced match
    };
    instance?: boolean;
    flags?: string; // activity flags OR d together, describes what the payload includes

    // Spotify and other rich presence data
    id?: string;
    sync_id?: string;
    metadata?: {
        // spotify
        button_urls?: string[];
        context_uri?: string;
        album_id?: string;
        artist_ids?: string[];
        type?: "track" | "episode";
        label?: string; // undocumented
    };
    session_id?: string;
}

export enum ActivityType {
    GAME = 0,
    STREAMING = 1,
    LISTENING = 2,
    CUSTOM = 4,
    COMPETING = 5,
}

export enum ActivityStatusDisplayType {
    NAME = 0,
    STATE = 1,
    DETAILS = 2,
}
