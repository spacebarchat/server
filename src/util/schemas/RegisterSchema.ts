/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

export interface RegisterSchema {
	/**
	 * @minLength 2
	 * @maxLength 32
	 */
	username: string;
	/**
	 * @minLength 1
	 * @maxLength 72
	 */
	password?: string;
	consent: boolean;
	/**
	 * @TJS-format email
	 */
	email?: string;
	fingerprint?: string;
	invite?: string;
	/**
	 * @TJS-type string
	 */
	date_of_birth?: Date; // "2000-04-03"
	gift_code_sku_id?: string;
	captcha_key?: string;

	promotional_email_opt_in?: boolean;

	// part of pomelo
	unique_username_registration?: boolean;
	global_name?: string;
}
