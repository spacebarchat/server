/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type { ApexExperimentsResponse, ExperimentsResponse } from "@spacebar/schemas";
import { createClientFingerprint, isClientFingerprint } from "./Fingerprint";

export function createExperimentsResponse(): ExperimentsResponse {
    return {
        fingerprint: createClientFingerprint(),
        assignments: [],
        guild_experiments: [],
    };
}

export function createApexExperimentsResponse(installation?: string): ApexExperimentsResponse {
    const response: ApexExperimentsResponse = {
        assignments: {},
    };

    // Discord clients send X-Installation-ID after receiving one. Apex only
    // returns a new installation when the client has not supplied a usable id;
    // empty assignments are still a valid no-experiment fallback.
    if (!isClientFingerprint(installation)) {
        response.installation = createClientFingerprint();
    }

    return response;
}
