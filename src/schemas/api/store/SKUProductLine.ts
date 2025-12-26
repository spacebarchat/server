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

export enum SKUProductLine {
    /**
     * Premium (Nitro) subscription
     *
     * Value: 1
     * Name: PREMIUM
     */
    PREMIUM = 1,
    /**
     * Premium guild (boosting) subscription
     *
     * Value: 2
     * Name: PREMIUM_GUILD
     */
    PREMIUM_GUILD = 2,
    /**
     * Embedded activity in-app purchase
     *
     * Value: 3
     * Name: ACTIVITY_IAP
     */
    ACTIVITY_IAP = 3,
    /**
     * Guild role subscription or ticketed event
     *
     * Value: 4
     * Name: GUILD_ROLE
     */
    GUILD_ROLE = 4,
    /**
     * Guild product
     *
     * Value: 5
     * Name: GUILD_PRODUCT
     */
    GUILD_PRODUCT = 5,
    /**
     * Application item
     *
     * Value: 6
     * Name: APPLICATION
     */
    APPLICATION = 6,
    /**
     * Discord collectible
     *
     * Value: 7
     * Name: COLLECTIBLES
     */
    COLLECTIBLES = 7,
    /**
     * In-game quest reward
     *
     * Value: 9
     * Name: QUEST_IN_GAME_REWARD
     */
    QUEST_IN_GAME_REWARD = 9,
    /**
     * Quest reward code
     *
     * Value: 10
     * Name: QUEST_REWARD_CODE
     */
    QUEST_REWARD_CODE = 10,
    /**
     * Fractional premium subscription
     *
     * Value: 11
     * Name: FRACTIONAL_PREMIUM
     */
    FRACTIONAL_PREMIUM = 11,
    /**
     * Virtual currency
     *
     * Value: 12
     * Name: VIRTUAL_CURRENCY
     */
    VIRTUAL_CURRENCY = 12,
    /**
     * Guild powerup
     *
     * Value: 13
     * Name: GUILD_POWERUP
     */
    GUILD_POWERUP = 13,
    /**
     * Social SDK game item
     *
     * Value: 14
     * Name: SOCIAL_LAYER_GAME_ITEM
     */
    SOCIAL_LAYER_GAME_ITEM = 14,
}
