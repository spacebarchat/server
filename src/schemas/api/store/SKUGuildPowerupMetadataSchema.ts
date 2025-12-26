/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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

import { GuildPremiumFeatures } from "@spacebar/schemas";
import { GuildPowerupCategoryType } from "./GuildPowerupCatagoryType";

export interface SKUGuildPowerupMetadataSchema {
    /**
     * The number of boosts the powerup costs
     */
    boost_price: number;
    /**
     * The maximum number of entitlements a guild can have for the powerup
     */
    purchase_limit: number;
    /**
     * The features granted by the powerup
     */
    guild_features: GuildPremiumFeatures;
    /**
     * The type of guild powerup
     */
    category_type: GuildPowerupCategoryType;
    /**
     * URL of the static banner image for the powerup
     */
    static_image_url: string;
    /**
     * URL of the animated banner image for the powerup
     */
    animated_image_url: string;
    /**
     * When the powerup will be removed from the store
     */
    store_removal_date?: string | null;
}
