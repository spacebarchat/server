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

export enum ApplicationMonetizationState {
    /**
     * This application does not have monetization set up
     *
     * Value: 1
     * Name: NONE
     */
    NONE = 1,
    /**
     * This application has monetization set up
     *
     * Value: 2
     * Name: ENABLED
     */
    ENABLED = 2,
    /**
     * This application has been blocked from monetizing
     *
     * Value: 3
     * Name: BLOCKED
     */
    BLOCKED = 3,
}
