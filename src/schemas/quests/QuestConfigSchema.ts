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

import { QuestRewardConfigSchema } from "./QuestRewardConfigSchema";

import { QuestFeature, QuestSharePolicy } from ".";
import { QuestApplicationSchema } from "./QuestApplicationSchema";
import { QuestTaskConfigV2Schema } from "./QuestTaskConfigV2Schema";

export interface QuestConfigSchema {
    id: string;
    config_version: number; // as of now (12/24/2025) its 2
    starts_at: string; // ISO date
    expires_at: string; // ISO date
    features: QuestFeature[];
    application: QuestApplicationSchema;
    assets: {
        // The quest's hero image
        hero: string | null;
        // A video representation of the hero image
        hero_video?: string | null;
        // The hero image used in the quest popup that appears when launching the game before accepting the quest
        quest_bar_hero: string | null;
        // A video representation of the quest bar hero image
        quest_bar_hero_video?: string | null;
        // The game's icon
        game_tile: string | null;
        game_tile_dark: string | null;
        game_tile_light: string | null;
        // The game's logo
        logotype: string | null;
        logotype_dark: string | null;
        logotype_light: string | null;
    };
    colors: {
        primary: string; // hex color
        secondary: string; // hex color
    };
    messages: {
        // The name of the quest
        quest_name: string;
        // The title of the game the quest is for
        game_title: string;
        // The publisher of the game the quest is for
        game_publisher: string;
    };
    task_config?: unknown; // seems to be unused now in favor of task_config_v2
    task_config_v2: QuestTaskConfigV2Schema;
    rewards_config: QuestRewardConfigSchema;
    share_policy: QuestSharePolicy;
    cta_config: {
        button_label: string;
        link: string;
        subtitle?: string;
        android?: {
            android_app_id: string;
        };
        ios?: {
            ios_app_id: string;
        };
    };
}
