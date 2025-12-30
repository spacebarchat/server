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

export enum StoreApplicationState {
    /**
     * This application does not have a commerce license
     *
     * Value: 1
     * Name: NONE
     */
    NONE = 1,
    /**
     * This application has a commerce license but has not yet submitted a store approval request
     *
     * Value: 2
     * Name: PAID
     */
    PAID = 2,
    /**
     * This application has submitted a store approval request
     *
     * Value: 3
     * Name: SUBMITTED
     */
    SUBMITTED = 3,
    /**
     * This application has been approved for the store
     *
     * Value: 4
     * Name: APPROVED
     */
    APPROVED = 4,
    /**
     * This application has been rejected from the store
     *
     * Value: 5
     * Name: REJECTED
     */
    REJECTED = 5,
}
