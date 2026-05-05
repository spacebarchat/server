export type GatewayEventUnsubscribe = () => Promise<unknown>;

export async function unsubscribeEventIds(events: Record<string, GatewayEventUnsubscribe | undefined>, ids: Iterable<string>) {
    await Promise.all(
        [...new Set(ids)].map(async (id) => {
            const unsubscribe = events[id];
            if (!unsubscribe) return;

            delete events[id];
            await unsubscribe();
        }),
    );
}
