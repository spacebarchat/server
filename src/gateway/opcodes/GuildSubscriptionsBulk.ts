import { WebSocket, Payload } from "@spacebar/gateway";
import { onLazyRequest } from "./LazyRequest";
import { GuildSubscriptionsBulkSchema } from "@spacebar/schemas";
export async function onGuildSubscriptionsBulk(this: WebSocket, payload: Payload) {
    const startTime = Date.now();
    const body = GuildSubscriptionsBulkSchema.parse(payload.d);

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
    console.log(
        `[Gateway/${this.user_id}] GuildSubscriptionsBulk processed ${Object.keys(body.subscriptions).length} subscriptions for user ${this.user_id} in ${Date.now() - startTime}ms`,
    );
}
