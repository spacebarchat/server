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

export enum RPCApplicationState {
    /**
     * This application does not have access to RPC
     *
     * Value: 0
     * Name: DISABLED
     */
    DISABLED = 0,
    /**
     * This application has not yet been applied for RPC access
     *
     * Value: 1
     * Name: UNSUBMITTED
     */
    UNSUBMITTED = 1,
    /**
     * This application has submitted a RPC access request
     *
     * Value: 2
     * Name: SUBMITTED
     */
    SUBMITTED = 2,
    /**
     * This application has been approved for RPC access
     *
     * Value: 3
     * Name: APPROVED
     */
    APPROVED = 3,
    /**
     * This application has been rejected from RPC access
     *
     * Value: 4
     * Name: REJECTED
     */
    REJECTED = 4,
}
