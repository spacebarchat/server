export interface PageResult<T> {
    items: T[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

export interface AdminUserListItem {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    pronouns: string | null;
    premium: boolean;
    premiumType: number;
    bot: boolean;
    system: boolean;
    createdAt: string | null;
    disabled: boolean;
    deleted: boolean;
    rights: string;
}

export interface AdminUser extends AdminUserListItem {
    email: string | null;
    phone: string | null;
    desktop: boolean;
    mobile: boolean;
    nsfwAllowed: boolean;
    mfaEnabled: boolean;
    webauthnEnabled: boolean;
    verified: boolean;
    counts: Record<string, number>;
}

export interface AdminGuildListItem {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    ownerId: string | null;
    features: string[];
    memberCount: number | null;
    presenceCount: number | null;
    preferredLocale: string | null;
    premiumTier: number | null;
    discoveryWeight: number;
    discoveryExcluded: boolean;
}

export interface AdminGuild extends AdminGuildListItem {
    banner: string | null;
    splash: string | null;
    discoverySplash: string | null;
    verificationLevel: number | null;
    nsfw: boolean;
    nsfwLevel: number | null;
    channelOrdering: string[];
    counts: Record<string, number>;
}

export interface AdminSticker {
    id: string;
    name: string;
    description: string | null;
    available: boolean | null;
    tags: string | null;
    packId: string | null;
    guildId: string | null;
    userId: string | null;
    type: number;
    formatType: number;
}

export interface AdminAttachment {
    id: string;
    filename: string;
    size: number;
    height: number | null;
    width: number | null;
    contentType: string | null;
    messageId: string | null;
    channelId: string | null;
    authorId: string | null;
    guildId: string | null;
    timestamp: string | null;
    url: string | null;
    proxyUrl: string | null;
}

export interface AdminConfiguration {
    source: "database" | "json";
    path: string | null;
    readonly: boolean;
    values: unknown;
}

export interface AdminJob {
    id: string;
    type: string;
    status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
    input: unknown;
    result: unknown;
    progress: {
        current: number;
        total: number | null;
        label: string | null;
    };
    errors: string[];
    cancelRequested: boolean;
    idempotencyKey: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    startedAt: string | null;
    completedAt: string | null;
}

export interface AdminAuditRecord {
    id: string;
    action: string;
    actorId: string;
    targetType: string;
    targetId: string;
    status: "accepted" | "succeeded" | "failed" | "cancel_requested";
    severity: "info" | "warning" | "danger";
    metadata: Record<string, unknown>;
    jobId: string | null;
    createdAt: string;
}
