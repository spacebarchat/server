import { AutomodRuleEventType } from "@spacebar/schemas";
import { AutomodRule, Member, Message, Role } from "@spacebar/util";
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

		console.log(`[Automod] Executed automod invocation of type ${invocation.eventType} in ${Date.now() - startTime}ms with ${matchingRules.length} matching rules. Result: ${result.blocked ? "blocked" : "allowed"}`);

		return result;
	}

	private static async executeMemberInvocation() {
		return {
			blocked: false,
		};
	}
}
