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

import { QuestUserStatusProgressSchema } from "./QuestUserStatusProgressSchema";

export interface QuestUserStatusSchema {
    // The ID of the user
    user_id: string;
    // The ID of the quest
    quest_id: string;
    // When the user accepted the quest
    enrolled_at: null | string;
    // When the user completed the quest
    completed_at: null | string;
    // When the user claimed the quest's reward
    claimed_at: null | string;
    // Which reward tier the user has claimed, if the quest's assignment_method is TIERED
    claimed_tier?: number | null;
    // When the last heartbeat was received. only used for quest config version 1, where the event is always STREAM_ON_DESKTOP.
    last_stream_heartbeat_at?: null | string;
    // Duration (in seconds) the user has streamed the game for since the quest was accepted. only used for quest config version 1, where the event is always STREAM_ON_DESKTOP.
    stream_progress_seconds: number;
    // The content areas the user has dismissed for the quest
    dismissed_quest_content?: number;
    // The user's progress for each task in the quest, keyed by their event name
    progress?: Record<string, QuestUserStatusProgressSchema>; // ive only seen this for watch video, watch video on mobile, and play on desktop
}
