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

import { AutomodRuleEventType } from "@spacebar/schemas";
import { AutomodRule, Member, Message, Role } from "@spacebar/database";
import { internalExecuteMessageAutomod } from "./AutomodMessageExecutor";

export class AutomodInvocation {
    eventType: AutomodRuleEventType;
    guildId: string;
    payload: unknown;
    noop: boolean = false;

    constructor(data: Partial<AutomodInvocation>) {
        for (const key in data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this[key] = data[key];
        }
    }
}
export interface AutomodMessageInvocation extends AutomodInvocation {
    eventType: AutomodRuleEventType.MESSAGE_SEND;
    payload: Message;
    roles: Role[];
}

export interface AutomodMemberInvocation extends AutomodInvocation {
    eventType: AutomodRuleEventType.GUILD_MEMBER_EVENT;
    payload: Member;
}

export interface AutomodResult {
    blocked: boolean;
}

export class AutomodExecutor {
    public static async executeInvocation(invocation: AutomodInvocation): Promise<AutomodResult> {
        const startTime = Date.now();
        const matchingRules = await AutomodRule.find({
            where: { guild_id: invocation.guildId, enabled: true, event_type: invocation.eventType },
            order: { position: "ASC" },
        });
        let result;
        if (invocation.eventType === AutomodRuleEventType.MESSAGE_SEND) {
            const author =
                (invocation as AutomodMessageInvocation).payload.member ??
                (await Member.findOne({
                    where: {
                        guild_id: invocation.guildId,
                        id: (invocation as AutomodMessageInvocation).payload.member_id,
                    },
                    relations: { roles: true },
                }));
            (invocation as AutomodMessageInvocation).roles = author ? author.roles : [];
            result = await internalExecuteMessageAutomod(invocation as AutomodMessageInvocation, matchingRules);
        } else if (invocation.eventType === AutomodRuleEventType.GUILD_MEMBER_EVENT) {
            result = await this.executeMemberInvocation();
        } else throw new Error("Unsupported automod invocation type");

        console.log(
            `[Automod] Executed automod invocation of type ${invocation.eventType} in ${Date.now() - startTime}ms with ${matchingRules.length} matching rules. Result: ${result.blocked ? "blocked" : "allowed"}`,
        );

        return result;
    }

    private static async executeMemberInvocation() {
        return {
            blocked: false,
        };
    }
}
