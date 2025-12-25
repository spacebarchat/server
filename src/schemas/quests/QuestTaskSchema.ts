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

import { QuestEventType } from ".";
import { QuestVideoAssetSchema } from "./QuestVideoAssetSchema";

export interface QuestTaskSchema {
    type: QuestEventType;
    target: number; // seconds the task requires
    assets?: {
        video: QuestVideoAssetSchema; // pretty sure this is always present
        video_low_res?: QuestVideoAssetSchema;
        video_hls?: QuestVideoAssetSchema;
    }; // WATCH_VIDEO, WATCH_VIDEO_ON_MOBILE
    applications?: {
        id: string;
    }[]; // All except watch video types
    external_ids?: string[]; // game id on the external platform im pretty sure. PLAY_ON_XBOX, PLAY_ON_PLAYSTATION
    messages?: {
        video_title?: string; // WATCH_VIDEO, WATCH_VIDEO_ON_MOBILE
        task_title?: string; // ACHIEVEMENT_IN_GAME, ACHIEVEMENT_IN_ACTIVITY
        task_description?: string; // ACHIEVEMENT_IN_GAME, ACHIEVEMENT_IN_ACTIVITY
    }; // ACHIEVEMENT_IN_GAME, ACHIEVEMENT_IN_ACTIVITY, WATCH_VIDEO, WATCH_VIDEO_ON_MOBILE
    event_name?: string; // ?? seems to be used in a request. ACHIEVEMENT_IN_GAME, ACHIEVEMENT_IN_ACTIVITY
}
