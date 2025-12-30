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

export enum ApplicationGuildRestriction {
    /**
     * The application can be authorized in any guild
     *
     * Value: 1
     * Name: JOIN_ALL
     */
    JOIN_ALL = 1,
    /**
     * The application can only be authorized in guilds without the INTERNAL_EMPLOYEE_ONLY guild feature
     *
     * Value: 2
     * Name: JOIN_EXTERNAL_ONLY
     */
    JOIN_EXTERNAL_ONLY = 2,
    /**
     * The application can only be authorized in guilds with the INTERNAL_EMPLOYEE_ONLY guild feature
     *
     * Value: 3
     * Name: JOIN_INTERNAL_ONLY
     */
    JOIN_INTERNAL_ONLY = 3,
}
