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

import { BitField } from "./BitField";

export class ApplicationMonetizationEligibilityFlags extends BitField {
    static FLAGS = {
        VERIFIED: BigInt(1) << BigInt(0),
        HAS_TEAM: BigInt(1) << BigInt(1),
        APPROVED_COMMANDS: BigInt(1) << BigInt(2),
        TERMS_OF_SERVICE: BigInt(1) << BigInt(3),
        PRIVACY_POLICY: BigInt(1) << BigInt(4),
        SAFE_NAME: BigInt(1) << BigInt(5),
        SAFE_DESCRIPTION: BigInt(1) << BigInt(6),
        SAFE_ROLE_CONNECTIONS: BigInt(1) << BigInt(7),
        USER_IS_TEAM_OWNER: BigInt(1) << BigInt(8),
        NOT_QUARANTINED: BigInt(1) << BigInt(9),
        USER_LOCALE_SUPPORTED: BigInt(1) << BigInt(10),
        USER_AGE_SUPPORTED: BigInt(1) << BigInt(11),
        USER_DATE_OF_BIRTH_DEFINED: BigInt(1) << BigInt(12),
        USER_MFA_ENABLED: BigInt(1) << BigInt(13),
        USER_EMAIL_VERIFIED: BigInt(1) << BigInt(14),
        TEAM_MEMBERS_EMAIL_VERIFIED: BigInt(1) << BigInt(15),
        TEAM_MEMBERS_MFA_ENABLED: BigInt(1) << BigInt(16),
        NO_BLOCKING_ISSUES: BigInt(1) << BigInt(17),
        VALID_PAYOUT_STATUS: BigInt(1) << BigInt(18),
    };
}
