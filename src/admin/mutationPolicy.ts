import { HTTPError } from "lambert-server";

export const AdminChannelType = {
    GUILD_TEXT: 0,
    DM: 1,
    GROUP_DM: 3,
    GUILD_PUBLIC_THREAD: 11,
} as const;

export interface AdminDiscoveryGuildUpdate {
    discoveryExcluded?: boolean;
    discoveryWeight?: number;
}

export interface AdminForceJoinInput {
    userId?: string;
    makeOwner: boolean;
    makeAdmin: boolean;
}

export interface AdminThreadDeleteEventInput {
    id: string;
    guild_id?: string;
    parent_id: string | null;
    type: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptionalBoolean(value: unknown, field: string): boolean | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "boolean") throw new HTTPError(`${field} must be a boolean`, 400);
    return value;
}

function parseOptionalNumber(value: unknown, field: string): number | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "number" || !Number.isFinite(value)) throw new HTTPError(`${field} must be a finite number`, 400);
    return value;
}

export function parseAdminDiscoveryGuildUpdate(body: unknown): AdminDiscoveryGuildUpdate {
    if (!isRecord(body)) throw new HTTPError("Discovery guild update body must be an object", 400);

    const discoveryExcluded = parseOptionalBoolean(body.discoveryExcluded ?? body.discovery_excluded, "discoveryExcluded");
    const discoveryWeight = parseOptionalNumber(body.discoveryWeight ?? body.discovery_weight, "discoveryWeight");

    if (discoveryExcluded === undefined && discoveryWeight === undefined) {
        throw new HTTPError("At least one supported discovery field is required", 400);
    }

    return {
        discoveryExcluded,
        discoveryWeight,
    };
}

export function parseAdminForceJoinInput(body: unknown): AdminForceJoinInput {
    const input = isRecord(body) ? body : {};
    const userId = typeof input.userId === "string" && input.userId.trim() ? input.userId.trim() : undefined;
    const makeOwner = input.makeOwner === true;
    const makeAdmin = input.makeAdmin === true;

    return {
        userId,
        makeOwner,
        makeAdmin: makeOwner ? false : makeAdmin,
    };
}

export function assertAdminChannelDeletionSupported(channel: Pick<AdminThreadDeleteEventInput, "type">) {
    if (channel.type === AdminChannelType.DM || channel.type === AdminChannelType.GROUP_DM) {
        throw new HTTPError("Admin channel deletion does not support DM or group DM channels", 400);
    }
}

export function createAdminThreadDeleteEvent(channel: AdminThreadDeleteEventInput) {
    return {
        event: "THREAD_DELETE" as const,
        data: {
            id: channel.id,
            guild_id: channel.guild_id,
            parent_id: channel.parent_id,
            type: channel.type,
        },
        guild_id: channel.guild_id,
    };
}
