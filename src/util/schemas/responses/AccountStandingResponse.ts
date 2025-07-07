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

export interface AccountStandingResponse {
	classifications: unknown[]; // TODO: We don't know what this is yet
	guild_classifications: unknown[]; // TODO: We don't know what this is yet
	account_standing: {
		/**
		 * @defaultValue 100
		 * @minimum 0
		 * @maximum 100
		 */
		state: number;
	};
	is_dsa_eligible: boolean;
	username: string;
	discriminator: string; // Not sure if this is even valid, we don't have any examples of pre-pomelo users
	is_appeal_eligible: boolean;
	/**
	 * @description We don't yet know what these mean, but Discord appears to return "1" and "2".
	 */
	appeal_eligibility: number[];
}
