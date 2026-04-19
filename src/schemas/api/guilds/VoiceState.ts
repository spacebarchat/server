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

//TODO: remove entity import
import { VoiceState } from "@spacebar/util";

export enum PublicVoiceStateEnum {
    user_id,
    suppress,
    session_id,
    self_video,
    self_mute,
    self_deaf,
    self_stream,
    request_to_speak_timestamp,
    mute,
    deaf,
    channel_id,
    guild_id,
}

export type PublicVoiceStateKeys = keyof typeof PublicVoiceStateEnum;

export const PublicVoiceStateProjection = Object.values(PublicVoiceStateEnum).filter((x) => typeof x === "string") as PublicVoiceStateKeys[];

export type PublicVoiceState = Pick<VoiceState, PublicVoiceStateKeys>;
