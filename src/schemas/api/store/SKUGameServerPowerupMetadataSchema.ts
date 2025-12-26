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

import { GuildPremiumFeatures } from "../guilds";
import { GuildPowerupCategoryType } from "./GuildPowerupCatagoryType";
import { SKUGameServerPowerupProvider } from "./SKUGameServerPowerupProvider";

export interface SKUGameServerPowerupMetadataSchema {
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
     * The available providers
     */
    available_providers: SKUGameServerPowerupProvider[];
    /**
     * The amount of RAM in megabytes that the game server provides
     */
    memory: number;
    /**
     * The amount of CPU cores that the game server provides
     */
    cpu: number;
    /**
     * The amount of storage in gigabytes that the game server provides
     */
    storage: number;
    /**
     * Maximum amount of players that can connect to the game server
     */
    max_slots: number;
    /**
     * Human-readable amount of RAM that the game server provides
     */
    memory_string: string;
    /**
     * Human-readable maximum amount of players that can connect to the game server
     */
    player_string: string;
}
