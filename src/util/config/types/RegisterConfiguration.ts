/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import {
	DateOfBirthConfiguration,
	EmailConfiguration,
	PasswordConfiguration,
} from ".";

export class RegisterConfiguration {
	email: EmailConfiguration = new EmailConfiguration();
	dateOfBirth: DateOfBirthConfiguration = new DateOfBirthConfiguration();
	password: PasswordConfiguration = new PasswordConfiguration();
	disabled: boolean = false;
	requireCaptcha: boolean = true;
	requireInvite: boolean = false;
	guestsRequireInvite: boolean = true;
	allowNewRegistration: boolean = true;
	allowMultipleAccounts: boolean = true;
	blockProxies: boolean = true;
	incrementingDiscriminators: boolean = false; // random otherwise
	defaultRights: string = "312119568366592"; // See `npm run generate:rights`
}
