export interface GuildCreateRoleInput {
    id?: string;
    name?: string;
    permissions?: string;
    color?: number;
    colors?: {
        primary_color: number;
        secondary_color?: number | null;
        tertiary_color?: number | null;
    };
    hoist?: boolean;
    managed?: boolean;
    mentionable?: boolean;
    position?: number;
    icon?: string;
    unicode_emoji?: string;
    flags?: number;
}

export interface NormalizedGuildCreateRole {
    id?: string;
    name: string;
    permissions: string;
    color: number;
    colors: {
        primary_color: number;
        secondary_color?: number | undefined;
        tertiary_color?: number | undefined;
    };
    hoist: boolean;
    managed: boolean;
    mentionable: boolean;
    position: number;
    icon?: string;
    unicode_emoji?: string;
    flags: number;
}

export interface GuildCreateChannelReferenceInput {
    afk_channel_id?: string | null;
    rules_channel_id?: string | null;
    system_channel_id?: string | null;
}

export interface GuildCreatePermissionOverwriteInput {
    allow: string;
    deny: string;
    id: string;
    type: number;
}

const rolePermissionOverwriteType = 0;

export function isGuildCreateEveryoneRole(role: GuildCreateRoleInput, sourceGuildId: string | null): boolean {
    return role.id === "0" || (!!sourceGuildId && role.id === sourceGuildId);
}

export function getGuildCreateEveryoneRole(roles: GuildCreateRoleInput[] | undefined, sourceGuildId: string | null): GuildCreateRoleInput | undefined {
    return roles?.find((role) => isGuildCreateEveryoneRole(role, sourceGuildId));
}

export function getGuildCreateCustomRoles(roles: GuildCreateRoleInput[] | undefined, sourceGuildId: string | null): GuildCreateRoleInput[] {
    return roles?.filter((role) => !isGuildCreateEveryoneRole(role, sourceGuildId)) ?? [];
}

export function normalizeGuildCreateRole(role: GuildCreateRoleInput, fallback: NormalizedGuildCreateRole): NormalizedGuildCreateRole {
    const color = role.color ?? role.colors?.primary_color ?? fallback.color;
    const colors = role.colors ?? { primary_color: color };
    const normalizedColors: NormalizedGuildCreateRole["colors"] = {
        primary_color: colors.primary_color,
    };
    if (colors.secondary_color !== null && colors.secondary_color !== undefined) normalizedColors.secondary_color = colors.secondary_color;
    if (colors.tertiary_color !== null && colors.tertiary_color !== undefined) normalizedColors.tertiary_color = colors.tertiary_color;

    const normalized: NormalizedGuildCreateRole = {
        name: role.name ?? fallback.name,
        permissions: role.permissions ?? fallback.permissions,
        color,
        colors: normalizedColors,
        hoist: role.hoist ?? fallback.hoist,
        managed: role.managed ?? fallback.managed,
        mentionable: role.mentionable ?? fallback.mentionable,
        position: role.position ?? fallback.position,
        flags: role.flags ?? fallback.flags,
    };

    const id = role.id ?? fallback.id;
    if (id !== undefined) normalized.id = id;
    const icon = role.icon ?? fallback.icon;
    if (icon !== undefined) normalized.icon = icon;
    const unicodeEmoji = role.unicode_emoji ?? fallback.unicode_emoji;
    if (unicodeEmoji !== undefined) normalized.unicode_emoji = unicodeEmoji;

    return normalized;
}

export function resolveGuildCreateChannelReferences(body: GuildCreateChannelReferenceInput, ids: Map<string, string>): GuildCreateChannelReferenceInput {
    return {
        afk_channel_id: resolveGuildCreateChannelReference(body.afk_channel_id, ids),
        rules_channel_id: resolveGuildCreateChannelReference(body.rules_channel_id, ids),
        system_channel_id: resolveGuildCreateChannelReference(body.system_channel_id, ids),
    };
}

export function resolveGuildCreatePermissionOverwrites(
    permissionOverwrites: GuildCreatePermissionOverwriteInput[] | undefined,
    roleIds: Map<string, string>,
): GuildCreatePermissionOverwriteInput[] | undefined {
    if (!permissionOverwrites) return permissionOverwrites;

    return permissionOverwrites.map((overwrite) => {
        if (overwrite.type !== rolePermissionOverwriteType) return overwrite;

        const id = roleIds.get(overwrite.id);
        if (!id) return overwrite;

        return {
            ...overwrite,
            id,
        };
    });
}

function resolveGuildCreateChannelReference(channelId: string | null | undefined, ids: Map<string, string>): string | null | undefined {
    if (channelId === null || channelId === undefined) return channelId;
    return ids.get(channelId);
}
