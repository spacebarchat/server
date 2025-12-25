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

import { QuestPlatformType } from ".";

export interface QuestRewardCodeSchema {
    // The ID of the quest
    quest_id: string;
    // The redeem code
    code: string;
    // The platform this redeem code applies to
    platform: QuestPlatformType;
    // The ID of the user who this code belongs to
    user_id: string;
    // When the user claimed the quest's reward
    claimed_at: string;
    // Which reward tier the code belongs to, if the quest's assignment_method is set to TIERED
    tier: number | null;
}
