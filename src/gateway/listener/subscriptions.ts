export type GatewayEventUnsubscribe = () => Promise<unknown>;
export type GatewayEventMap = Record<string, GatewayEventUnsubscribe | undefined>;
export type GatewayEventIdSetMap = Record<string, Set<string>>;

export interface GatewayEventRoute {
    guild_id?: string;
    channel_id?: string;
    user_id?: string;
    session_id?: string;
}

export function getEventRouteId(route: GatewayEventRoute) {
    return route.guild_id ?? route.channel_id ?? route.user_id ?? route.session_id;
}

export function isEventRouteSubscribed(events: GatewayEventMap, route: GatewayEventRoute) {
    const id = getEventRouteId(route);

    return !id || !!events[id];
}

export function trackGuildEventId(guildEventIds: GatewayEventIdSetMap, guildId: string, eventId: string) {
    guildEventIds[guildId] ??= new Set();
    guildEventIds[guildId].add(eventId);
}

export function untrackGuildEventId(guildEventIds: GatewayEventIdSetMap, guildId: string | undefined, eventId: string) {
    const guildIds = guildId ? [guildId] : Object.keys(guildEventIds);

    for (const trackedGuildId of guildIds) {
        const eventIds = guildEventIds[trackedGuildId];
        if (!eventIds) continue;

        eventIds.delete(eventId);
        if (!eventIds.size) delete guildEventIds[trackedGuildId];
    }
}

export function trackGuildMemberEventId(guildMemberEventIds: GatewayEventIdSetMap, memberEventGuildIds: GatewayEventIdSetMap, guildId: string, userId: string) {
    guildMemberEventIds[guildId] ??= new Set();
    guildMemberEventIds[guildId].add(userId);

    memberEventGuildIds[userId] ??= new Set();
    memberEventGuildIds[userId].add(guildId);
}

export function hasGuildMemberEventId(guildMemberEventIds: GatewayEventIdSetMap, guildId: string, userId: string) {
    return !!guildMemberEventIds[guildId]?.has(userId);
}

export async function unsubscribeEventIds(events: GatewayEventMap, ids: Iterable<string>) {
    await Promise.all(
        [...new Set(ids)].map(async (id) => {
            const unsubscribe = events[id];
            if (!unsubscribe) return;

            delete events[id];
            await unsubscribe();
        }),
    );
}

export async function unsubscribeGuildEventIds(events: GatewayEventMap, guildEventIds: GatewayEventIdSetMap, guildId: string) {
    const trackedEventIds = guildEventIds[guildId];
    const eventIds = trackedEventIds?.size ? [...trackedEventIds] : [guildId];

    delete guildEventIds[guildId];

    await unsubscribeEventIds(events, eventIds);
}

export async function unsubscribeGuildMemberEventIds(
    memberEvents: GatewayEventMap,
    guildMemberEventIds: GatewayEventIdSetMap,
    memberEventGuildIds: GatewayEventIdSetMap,
    guildId: string,
    userIds?: Iterable<string>,
) {
    const ids = userIds ? [...new Set(userIds)] : [...(guildMemberEventIds[guildId] ?? [])];
    if (!ids.length) {
        if (!userIds) delete guildMemberEventIds[guildId];
        return;
    }

    if (userIds) {
        const guildUserIds = guildMemberEventIds[guildId];
        if (guildUserIds) {
            for (const userId of ids) guildUserIds.delete(userId);
            if (!guildUserIds.size) delete guildMemberEventIds[guildId];
        }
    } else {
        delete guildMemberEventIds[guildId];
    }

    const unreferencedUserIds: string[] = [];
    for (const userId of ids) {
        const guildIds = memberEventGuildIds[userId];
        if (!guildIds) {
            if (memberEvents[userId]) unreferencedUserIds.push(userId);
            continue;
        }

        guildIds.delete(guildId);
        if (!guildIds.size) {
            delete memberEventGuildIds[userId];
            unreferencedUserIds.push(userId);
        }
    }

    await unsubscribeEventIds(memberEvents, unreferencedUserIds);
}
