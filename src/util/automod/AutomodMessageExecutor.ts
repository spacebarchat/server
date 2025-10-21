import { AutomodMessageInvocation, AutomodResult } from "./";
import { AutomodRule } from "@spacebar/util";
import { AutomodRuleTriggerType } from "@spacebar/schemas*";

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
		let triggered = false;
		// if (rule.trigger_type == AutomodRuleTriggerType.KEYWORD)

	}

	return result;
}
