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

export enum ApplicationVerificationState {
    /**
     * This application is ineligible for verification
     *
     * Value: 1
     * Name: INELIGIBLE
     */
    INELIGIBLE = 1,
    /**
     * This application has not yet been applied for verification
     *
     * Value: 2
     * Name: UNSUBMITTED
     */
    UNSUBMITTED = 2,
    /**
     * This application has submitted a verification request
     *
     * Value: 3
     * Name: SUBMITTED
     */
    SUBMITTED = 3,
    /**
     * This application has been verified manually from Discord staff or using the old verification process
     *
     * Value: 4
     * Name: APPROVED_MANUALLY
     */
    APPROVED_MANUALLY = 4,
    /**
     * This application is blocked and cannot be verified
     *
     * Value: 5
     * Name: BLOCKED
     */
    BLOCKED = 5,
    /**
     * This application has been verified automatically through the Stripe identity verification process
     *
     * Value: 6
     * Name: APPROVED_AUTOMATICALLY
     */
    APPROVED_AUTOMATICALLY = 6,
}
