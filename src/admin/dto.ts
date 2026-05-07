import { Config, Guild, Sticker, User } from "@spacebar/util";

type Nullable<T> = T | null;

function date(value: Date | string | null | undefined): Nullable<string> {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    return value;
}

function stringValue(value: bigint | number | string | null | undefined): string {
    return value == null ? "0" : String(value);
}

function optional<T>(value: T | null | undefined): Nullable<T> {
    return value ?? null;
}

function array<T>(value: T[] | null | undefined): T[] {
    return Array.isArray(value) ? value : [];
}

export interface AdminUserListItem {
    id: string;
    username: string;
    discriminator: string;
    avatar: Nullable<string>;
    accentColor: Nullable<number>;
    banner: Nullable<string>;
    pronouns: Nullable<string>;
    premium: boolean;
    premiumType: number;
    bot: boolean;
    system: boolean;
    createdAt: Nullable<string>;
    premiumSince: Nullable<string>;
    disabled: boolean;
    deleted: boolean;
    flags: string;
    publicFlags: string;
    rights: string;
}

export interface AdminUserCounts {
    guildCount: number;
    ownedGuildCount: number;
    sessionCount: number;
    templateCount: number;
    voiceStateCount: number;
    messageCount: number;
}

export interface AdminUser extends AdminUserListItem {
    themeColors: number[];
    phone: Nullable<string>;
    desktop: boolean;
    mobile: boolean;
    bio: string;
    nsfwAllowed: boolean;
    mfaEnabled: boolean;
    webauthnEnabled: boolean;
    verified: boolean;
    email: Nullable<string>;
    purchasedFlags: string;
    premiumUsageFlags: number;
    applicationBotUser: null;
    connectedAccounts: [];
    counts: AdminUserCounts;
}

export interface AdminWhoami {
    user: AdminUser;
    sessionId: Nullable<string>;
    operator: true;
}

export function toAdminUserListItem(user: User): AdminUserListItem {
    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: optional(user.avatar),
        accentColor: optional(user.accent_color),
        banner: optional(user.banner),
        pronouns: optional(user.pronouns),
        premium: Boolean(user.premium),
        premiumType: user.premium_type ?? 0,
        bot: Boolean(user.bot),
        system: Boolean(user.system),
        createdAt: date(user.created_at),
        premiumSince: date(user.premium_since),
        disabled: Boolean(user.disabled),
        deleted: Boolean(user.deleted),
        flags: stringValue(user.flags),
        publicFlags: stringValue(user.public_flags),
        rights: stringValue(user.rights),
    };
}

export function toAdminUser(user: User, counts: AdminUserCounts): AdminUser {
    return {
        ...toAdminUserListItem(user),
        themeColors: array(user.theme_colors),
        phone: optional(user.phone),
        desktop: Boolean(user.desktop),
        mobile: Boolean(user.mobile),
        bio: user.bio ?? "",
        nsfwAllowed: Boolean(user.nsfw_allowed),
        mfaEnabled: Boolean(user.mfa_enabled),
        webauthnEnabled: Boolean(user.webauthn_enabled),
        verified: Boolean(user.verified),
        email: optional(user.email),
        purchasedFlags: stringValue(user.purchased_flags),
        premiumUsageFlags: user.premium_usage_flags ?? 0,
        applicationBotUser: null,
        connectedAccounts: [],
        counts,
    };
}

export interface AdminGuildListItem {
    id: string;
    name: string;
    icon: Nullable<string>;
    description: Nullable<string>;
    ownerId: Nullable<string>;
    features: string[];
    memberCount: Nullable<number>;
    presenceCount: Nullable<number>;
    preferredLocale: Nullable<string>;
    premiumTier: Nullable<number>;
    discoveryWeight: number;
    discoveryExcluded: boolean;
}

export interface AdminGuildCounts {
    channelCount: number;
    roleCount: number;
    emojiCount: number;
    stickerCount: number;
    inviteCount: number;
    messageCount: number;
    banCount: number;
    voiceStateCount: number;
}

export interface AdminGuild extends AdminGuildListItem {
    afkChannelId: Nullable<string>;
    afkTimeout: Nullable<number>;
    banner: Nullable<string>;
    defaultMessageNotifications: Nullable<number>;
    discoverySplash: Nullable<string>;
    explicitContentFilter: Nullable<number>;
    primaryCategoryId: Nullable<string>;
    large: boolean;
    maxMembers: Nullable<number>;
    maxPresences: Nullable<number>;
    maxVideoChannelUsers: Nullable<number>;
    templateId: Nullable<string>;
    mfaLevel: Nullable<number>;
    premiumSubscriptionCount: Nullable<number>;
    publicUpdatesChannelId: Nullable<string>;
    rulesChannelId: Nullable<string>;
    region: Nullable<string>;
    splash: Nullable<string>;
    systemChannelId: Nullable<string>;
    systemChannelFlags: Nullable<number>;
    unavailable: boolean;
    verificationLevel: Nullable<number>;
    welcomeScreen: unknown;
    widgetChannelId: Nullable<string>;
    widgetEnabled: boolean;
    nsfwLevel: Nullable<number>;
    nsfw: boolean;
    parent: Nullable<string>;
    premiumProgressBarEnabled: boolean;
    channelOrdering: string[];
    counts: AdminGuildCounts;
}

export interface AdminDiscoveryGuild extends AdminGuildListItem {
    banner: Nullable<string>;
    splash: Nullable<string>;
    discoverySplash: Nullable<string>;
}

export function toAdminGuildListItem(guild: Guild): AdminGuildListItem {
    return {
        id: guild.id,
        name: guild.name,
        icon: optional(guild.icon),
        description: optional(guild.description),
        ownerId: optional(guild.owner_id),
        features: array(guild.features),
        memberCount: optional(guild.member_count),
        presenceCount: optional(guild.presence_count),
        preferredLocale: optional(guild.preferred_locale),
        premiumTier: optional(guild.premium_tier),
        discoveryWeight: guild.discovery_weight ?? 0,
        discoveryExcluded: Boolean(guild.discovery_excluded),
    };
}

export function toAdminGuild(guild: Guild, counts: AdminGuildCounts): AdminGuild {
    return {
        ...toAdminGuildListItem(guild),
        afkChannelId: optional(guild.afk_channel_id),
        afkTimeout: optional(guild.afk_timeout),
        banner: optional(guild.banner),
        defaultMessageNotifications: optional(guild.default_message_notifications),
        discoverySplash: optional(guild.discovery_splash),
        explicitContentFilter: optional(guild.explicit_content_filter),
        primaryCategoryId: optional(guild.primary_category_id),
        large: Boolean(guild.large),
        maxMembers: optional(guild.max_members),
        maxPresences: optional(guild.max_presences),
        maxVideoChannelUsers: optional(guild.max_video_channel_users),
        templateId: optional(guild.template_id),
        mfaLevel: optional(guild.mfa_level),
        premiumSubscriptionCount: optional(guild.premium_subscription_count),
        publicUpdatesChannelId: optional(guild.public_updates_channel_id),
        rulesChannelId: optional(guild.rules_channel_id),
        region: optional(guild.region),
        splash: optional(guild.splash),
        systemChannelId: optional(guild.system_channel_id),
        systemChannelFlags: optional(guild.system_channel_flags),
        unavailable: Boolean(guild.unavailable),
        verificationLevel: optional(guild.verification_level),
        welcomeScreen: guild.welcome_screen ?? null,
        widgetChannelId: optional(guild.widget_channel_id),
        widgetEnabled: Boolean(guild.widget_enabled),
        nsfwLevel: optional(guild.nsfw_level),
        nsfw: Boolean(guild.nsfw),
        parent: optional(guild.parent),
        premiumProgressBarEnabled: Boolean(guild.premium_progress_bar_enabled),
        channelOrdering: array(guild.channel_ordering),
        counts,
    };
}

export function toAdminDiscoveryGuild(guild: Guild): AdminDiscoveryGuild {
    return {
        ...toAdminGuildListItem(guild),
        banner: optional(guild.banner),
        splash: optional(guild.splash),
        discoverySplash: optional(guild.discovery_splash),
    };
}

export interface AdminSticker {
    id: string;
    name: string;
    description: Nullable<string>;
    available: Nullable<boolean>;
    tags: Nullable<string>;
    packId: Nullable<string>;
    guildId: Nullable<string>;
    userId: Nullable<string>;
    type: number;
    formatType: number;
}

export function toAdminSticker(sticker: Sticker): AdminSticker {
    return {
        id: sticker.id,
        name: sticker.name,
        description: optional(sticker.description),
        available: optional(sticker.available),
        tags: optional(sticker.tags),
        packId: optional(sticker.pack_id),
        guildId: optional(sticker.guild_id),
        userId: optional(sticker.user_id),
        type: sticker.type,
        formatType: sticker.format_type,
    };
}

export interface AdminAttachmentRow {
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
    timestamp: Date | string | null;
}

export interface AdminAttachment {
    id: string;
    filename: string;
    size: number;
    height: Nullable<number>;
    width: Nullable<number>;
    contentType: Nullable<string>;
    messageId: Nullable<string>;
    channelId: Nullable<string>;
    authorId: Nullable<string>;
    guildId: Nullable<string>;
    timestamp: Nullable<string>;
    url: Nullable<string>;
    proxyUrl: Nullable<string>;
}

function attachmentUrl(row: { channel_id: string | null; filename: string; message_id: string | null }) {
    if (!row.channel_id || !row.message_id) return null;

    const base = Config.get().cdn.endpointPublic?.replace(/\/+$/, "") ?? "";
    return `${base}/attachments/${row.channel_id}/${row.message_id}/${row.filename}`;
}

export function toAdminAttachment(row: AdminAttachmentRow): AdminAttachment {
    const attachment = {
        channel_id: row.channelId,
        filename: row.filename,
        message_id: row.messageId,
    };
    const url = attachmentUrl(attachment);

    return {
        id: row.id,
        filename: row.filename,
        size: row.size,
        height: optional(row.height),
        width: optional(row.width),
        contentType: optional(row.contentType),
        messageId: optional(row.messageId),
        channelId: optional(row.channelId),
        authorId: optional(row.authorId),
        guildId: optional(row.guildId),
        timestamp: date(row.timestamp),
        url,
        proxyUrl: url,
    };
}

export interface AdminConfiguration {
    source: "database" | "json";
    path: Nullable<string>;
    readonly: boolean;
    values: unknown;
}

export function toAdminConfiguration(): AdminConfiguration {
    return {
        source: process.env.CONFIG_PATH ? "json" : "database",
        path: process.env.CONFIG_PATH ?? null,
        readonly: Boolean(process.env.CONFIG_READONLY),
        values: Config.get(),
    };
}
