import { WebSocket, Payload } from "@spacebar/gateway";
import { onLazyRequest } from "./LazyRequest";
import { getInvalidSchemaValues, GuildSubscriptionsBulkSchema, IdentifySchema, validateSchema } from "@spacebar/schemas";
import { check } from "./instanceOf";

export async function onGuildSubscriptionsBulk(this: WebSocket, payload: Payload) {
    const startTime = Date.now();

    // Check payload matches schema
    try {
        payload.d = validateSchema<GuildSubscriptionsBulkSchema>("GuildSubscriptionsBulkSchema", payload.d);
    } catch (e) {
        console.error("AJV validation of GuildSubscriptionsBulk schema failed:", e);
        console.error("Provided values:");
        if (Array.isArray(e))
            for (const invalidSchemaValue of getInvalidSchemaValues(payload.d, e)) {
                console.error(`${invalidSchemaValue.instancePath}:`, invalidSchemaValue.value);
            }

        check.call(this, GuildSubscriptionsBulkSchema, payload.d);
    }

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
    console.log(
        `[Gateway/${this.user_id}] GuildSubscriptionsBulk processed ${Object.keys(body.subscriptions).length} subscriptions for user ${this.user_id} in ${Date.now() - startTime}ms`,
    );
}
