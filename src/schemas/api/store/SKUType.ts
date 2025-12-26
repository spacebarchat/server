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

export enum SKUType {
    /**
     * Primary durable item
     *
     * Value: 1
     * Name: DURABLE_PRIMARY
     */
    DURABLE_PRIMARY = 1,
    /**
     * Durable item
     *
     * Value: 2
     * Name: DURABLE
     */
    DURABLE = 2,
    /**
     * Consumable item
     *
     * Value: 3
     * Name: CONSUMABLE
     */
    CONSUMABLE = 3,
    /**
     * Bundle of items
     *
     * Value: 4
     * Name: BUNDLE
     */
    BUNDLE = 4,
    /**
     * Subscription item
     *
     * Value: 5
     * Name: SUBSCRIPTION
     */
    SUBSCRIPTION = 5,
    /**
     * Group of subscription items
     *
     * Value: 6
     * Name: SUBSCRIPTION_GROUP
     */
    SUBSCRIPTION_GROUP = 6,
}
