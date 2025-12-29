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
export enum SubscriptionPlanPurchaseType {
    /**
     * Default pricing
     *
     * Value: 0
     * Name: DEFAULT
     */
    DEFAULT = 0,
    /**
     * Gift purchase pricing
     *
     * Value: 1
     * Name: GIFT
     */
    GIFT = 1,
    /**
     * Sale pricing
     *
     * Value: 2
     * Name: SALE
     */
    SALE = 2,
    /**
     * Nitro Classic subscriber pricing
     *
     * Value: 3
     * Name: PREMIUM_TIER_1
     */
    PREMIUM_TIER_1 = 3,
    /**
     * Nitro subscriber pricing
     *
     * Value: 4
     * Name: PREMIUM_TIER_2
     */
    PREMIUM_TIER_2 = 4,
    /**
     * Mobile purchase pricing
     *
     * Value: 5
     * Name: MOBILE
     */
    MOBILE = 5,
    /**
     * Nitro Basic subscriber pricing
     *
     * Value: 6
     * Name: PREMIUM_TIER_0
     */
    PREMIUM_TIER_0 = 6,
    /**
     * Mobile Nitro subscriber pricing
     *
     * Value: 7
     * Name: MOBILE_PREMIUM_TIER_2
     */
    MOBILE_PREMIUM_TIER_2 = 7,
}
