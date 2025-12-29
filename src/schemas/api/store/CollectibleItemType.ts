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

export enum CollectibleItemType {
    /**
     * An avatar decoration
     *
     * Value: 0
     * Name: AVATAR_DECORATION
     */
    AVATAR_DECORATION = 0,
    /**
     * A profile effect
     *
     * Value: 1
     * Name: PROFILE_EFFECT
     */
    PROFILE_EFFECT = 1,
    /**
     * A nameplate
     *
     * Value: 2
     * Name: NAMEPLATE
     */
    NAMEPLATE = 2,
    NONE = 100,
    /**
     * A bundle of collectibles
     *
     * Value: 1000
     * Name: BUNDLE
     */
    BUNDLE = 1000,
    /**
     * A group of variants
     *
     * Value: 2000
     * Name: VARIANTS_GROUP
     */
    VARIANTS_GROUP = 2000,
    /**
     * A non-collectible SKU (e.g. fractional premium)
     *
     * Value: 3000
     * Name: EXTERNAL_SKU
     */
    EXTERNAL_SKU = 3000,
}
