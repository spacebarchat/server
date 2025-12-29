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

export enum ShopBlockType {
    /**
     * A hero shop block
     *
     * Value: 0
     * Name: HERO
     */
    HERO = 0,
    /**
     * A featured shop block
     *
     * Value: 1
     * Name: FEATURED
     */
    FEATURED = 1,
    /**
     * A feed shop block
     *
     * Value: 2
     * Name: FEED
     */
    FEED = 2,
    /**
     * A wide banner shop block
     *
     * Value: 3
     * Name: WIDE_BANNER
     */
    WIDE_BANNER = 3,
    /**
     * A shelf shop block
     *
     * Value: 4
     * Name: SHELF
     */
    SHELF = 4,
    /**
     * A countdown timer shop block
     *
     * Value: 5
     * Name: COUNTDOWN_TIMER
     */
    COUNTDOWN_TIMER = 5,
    /**
     * An immersive banner shop block
     *
     * Value: 6
     * Name: IMMERSIVE_BANNER
     */
    IMMERSIVE_BANNER = 6,
    /**
     * A reward hero shop block
     *
     * Value: 7
     * Name: REWARD HERO
     */
    REWARD = 7,
}
