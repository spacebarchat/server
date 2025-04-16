import { WebSocket, Payload } from "@spacebar/gateway";
import { onLazyRequest } from "./LazyRequest";
import { GuildSubscriptionsBulkSchema } from "@spacebar/util";
import { check } from "./instanceOf";

export async function onGuildSubscriptionsBulk(
	this: WebSocket,
	payload: Payload,
) {
	check.call(this, GuildSubscriptionsBulkSchema, payload.d);
	const body = payload.d as GuildSubscriptionsBulkSchema;

	let guildId: keyof GuildSubscriptionsBulkSchema["subscriptions"];

	for (guildId in body.subscriptions) {
		await onLazyRequest.call(this, {
			...payload,
			d: {
				guild_id: guildId,
				...body.subscriptions[guildId],
			},
		});
	}
}
