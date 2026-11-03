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

import { AutomodMessageInvocation, AutomodResult } from "./";
import { AutomodRule } from "@spacebar/database";
import { AutomodRuleTriggerType } from "@spacebar/schemas";

export async function internalExecuteMessageAutomod(context: AutomodMessageInvocation, matchingRules: AutomodRule[]): Promise<AutomodResult> {
    const result: AutomodResult = {
        blocked: false,
    };

    for (const rule of matchingRules) {
        if (process.env.AUTOMOD_LOG_LEVEL ?? 0 >= 4) console.log(`[Automod] Checking rule "${rule.name}" ${context.noop ? " (noop)" : ""}:`, rule);

        if (rule.exempt_channels.some((id) => id === context.payload.channel_id)) {
            if (process.env.AUTOMOD_LOG_LEVEL ?? 0 >= 4) console.log(`[Automod] Skipping rule "${rule.name}" due to exempt channel:`, rule);
            continue;
        }

        if (rule.exempt_roles.length > 0 && context.roles.some((role) => rule.exempt_roles.includes(role.id))) {
            if (process.env.AUTOMOD_LOG_LEVEL ?? 0 >= 4) console.log(`[Automod] Skipping rule "${rule.name}" due to exempt role:`, rule);
            continue;
        }

        const triggered = false; // TODO: implement
        // if (rule.trigger_type == AutomodRuleTriggerType.KEYWORD)
    }

    return result;
}
