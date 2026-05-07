/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { isValidTotpCode, User } from "@spacebar/util";
import { HTTPError } from "lambert-server";

export function requireValidTotpCodeIfConfigured(totpSecret: string | null | undefined, code: unknown, invalidMessage: string): void {
    if (totpSecret && !isValidTotpCode(totpSecret, code)) {
        throw new HTTPError(invalidMessage, 60008);
    }
}

export async function requireTotpCodeIfConfigured(userId: string, code: unknown, invalidMessage: string): Promise<void> {
    const user = await User.findOneOrFail({
        where: { id: userId },
        select: { id: true, totp_secret: true },
    });

    requireValidTotpCodeIfConfigured(user.totp_secret, code, invalidMessage);
}
