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

import { QuestRewardExpirationMode } from "./QuestRewardExpirationMode";
import { QuestRewardType } from "./QuestRewardType";

export interface QuestRewardSchema {
    type: QuestRewardType;
    sku_id: string;
    asset?: string;
    asset_video?: string | null;
    messages: {
        name: string;
        name_with_article: string;
        redemption_instructions_by_platform: Record<string, string>;
    };
    // An approximate count of how many users can claim the reward
    approximate_count?: number | null;
    // The link to redeem the reward
    redemption_link?: string | null;
    // When the reward expires
    expires_at?: string | null;
    // When the reward expires for premium users
    expires_at_premium?: string | null;
    // The expiration mode
    expiration_mode?: QuestRewardExpirationMode;
    // The amount of virtual currency awarded
    orb_quantity?: number;
    // The days of fractional premium awarded
    quantity?: number;
}
