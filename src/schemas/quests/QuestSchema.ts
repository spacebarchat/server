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

import { QuestConfigSchema } from "./QuestConfigSchema";
import { QuestUserStatusSchema } from "./QuestUserStatusSchema";

export interface QuestSchema {
    // The ID of the quest
    id: string;
    // The configuration and metadata for the quest
    config: QuestConfigSchema;
    // Whether the quest is unreleased and in preview for Discord employees
    preview: boolean;
    // The content areas where the quest can be shown, deprecated
    targeted_content: unknown[];
    // The user's quest progress, if it has been accepted
    user_status: null | QuestUserStatusSchema;
}
