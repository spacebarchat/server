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

//TODO need more testing when community guild and voice stage channel are working
export interface VoiceStateUpdateSchema {
    guild_id?: string;
    channel_id?: string;
    self_mute: boolean;
    self_deaf: boolean;
    self_video?: boolean;
    preferred_region?: string;
    request_to_speak_timestamp?: Date;
    suppress?: boolean;
    flags?: number;
}

export const VoiceStateUpdateSchema = {
    $guild_id: String,
    $channel_id: String,
    self_mute: Boolean,
    self_deaf: Boolean,
    $self_video: Boolean, //required in docs but bots don't always send it
    $preferred_region: String,
    $request_to_speak_timestamp: Date,
    $suppress: Boolean,
    $flags: Number,
};
