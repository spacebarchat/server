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

export enum SKUESRBContentRating {
    /**
     * Suitable for all ages
     *
     * Value: 1
     * Name: EVERYONE
     */
    EVERYONE = 1,
    /**
     * Suitable for ages 10 and up
     *
     * Value: 2
     * Name: EVERYONE_TEN_PLUS
     */
    EVERYONE_TEN_PLUS = 2,
    /**
     * Suitable for ages 13 and up
     *
     * Value: 3
     * Name: TEEN
     */
    TEEN = 3,
    /**
     * Suitable for ages 17 and up
     *
     * Value: 4
     * Name: MATURE
     */
    MATURE = 4,
    /**
     * Suitable for ages 18 and up
     *
     * Value: 5
     * Name: ADULTS_ONLY
     */
    ADULTS_ONLY = 5,
    /**
     * Rating is pending
     *
     * Value: 6
     * Name: RATING_PENDING
     */
    RATING_PENDING = 6,
}
