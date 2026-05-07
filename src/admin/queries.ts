import { Attachment, Ban, Channel, Emoji, Guild, Invite, Member, Message, Role, Session, Sticker, Template, User, VoiceState } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import {
    AdminAttachment,
    AdminAttachmentRow,
    AdminConfiguration,
    AdminDiscoveryGuild,
    AdminGuild,
    AdminGuildListItem,
    AdminSticker,
    AdminUser,
    AdminUserListItem,
    toAdminAttachment,
    toAdminConfiguration,
    toAdminDiscoveryGuild,
    toAdminGuild,
    toAdminGuildListItem,
    toAdminSticker,
    toAdminUser,
    toAdminUserListItem,
} from "./dto";
import { Page, paginated } from "./pagination";

export interface AdminListOptions extends Page {
    q?: string;
}

const USER_PRIVATE_SELECTS = [
    "user.phone",
    "user.desktop",
    "user.mobile",
    "user.nsfw_allowed",
    "user.mfa_enabled",
    "user.webauthn_enabled",
    "user.verified",
    "user.email",
    "user.purchased_flags",
    "user.premium_usage_flags",
];

function search(value?: string) {
    return value ? `%${value}%` : undefined;
}

function notFound(entity: string): never {
    throw new HTTPError(`${entity} not found`, 404);
}

export async function listAdminUsers(options: AdminListOptions) {
    const qb = User.createQueryBuilder("user");
    const q = search(options.q);

    if (q) {
        qb.where("(CAST(user.id AS TEXT) ILIKE :q OR user.username ILIKE :q OR user.email ILIKE :q)", { q });
    }

    const [users, total] = await qb.orderBy("user.id", "DESC").take(options.limit).skip(options.offset).getManyAndCount();

    return paginated(users.map(toAdminUserListItem), total, options);
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
    const user = await User.createQueryBuilder("user").addSelect(USER_PRIVATE_SELECTS).where("user.id = :userId", { userId }).getOne();
    if (!user) notFound("User");

    const [guildCount, ownedGuildCount, sessionCount, templateCount, voiceStateCount, messageCount] = await Promise.all([
        Member.countBy({ id: userId }),
        Guild.countBy({ owner_id: userId }),
        Session.countBy({ user_id: userId }),
        Template.countBy({ creator_id: userId }),
        VoiceState.countBy({ user_id: userId }),
        Message.countBy({ author_id: userId }),
    ]);

    return toAdminUser(user, {
        guildCount,
        ownedGuildCount,
        sessionCount,
        templateCount,
        voiceStateCount,
        messageCount,
    });
}

export async function listAdminGuilds(options: AdminListOptions) {
    const qb = Guild.createQueryBuilder("guild");
    const q = search(options.q);

    if (q) {
        qb.where("(CAST(guild.id AS TEXT) ILIKE :q OR guild.name ILIKE :q OR CAST(guild.owner_id AS TEXT) ILIKE :q)", { q });
    }

    const [guilds, total] = await qb.orderBy("guild.id", "DESC").take(options.limit).skip(options.offset).getManyAndCount();

    return paginated(guilds.map(toAdminGuildListItem), total, options);
}

export async function getAdminGuild(guildId: string): Promise<AdminGuild> {
    const guild = await Guild.createQueryBuilder("guild").addSelect("guild.channel_ordering").where("guild.id = :guildId", { guildId }).getOne();
    if (!guild) notFound("Guild");

    const [channelCount, roleCount, emojiCount, stickerCount, inviteCount, messageCount, banCount, voiceStateCount] = await Promise.all([
        Channel.countBy({ guild_id: guildId }),
        Role.countBy({ guild_id: guildId }),
        Emoji.countBy({ guild_id: guildId }),
        Sticker.countBy({ guild_id: guildId }),
        Invite.countBy({ guild_id: guildId }),
        Message.countBy({ guild_id: guildId }),
        Ban.countBy({ guild_id: guildId }),
        VoiceState.countBy({ guild_id: guildId }),
    ]);

    return toAdminGuild(guild, {
        channelCount,
        roleCount,
        emojiCount,
        stickerCount,
        inviteCount,
        messageCount,
        banCount,
        voiceStateCount,
    });
}

export async function listAdminDiscoveryGuilds(options: AdminListOptions & { includeExcluded: boolean }) {
    const qb = Guild.createQueryBuilder("guild").where(":feature = ANY(guild.features)", { feature: "DISCOVERABLE" });
    const q = search(options.q);

    if (!options.includeExcluded) qb.andWhere("guild.discovery_excluded = false");
    if (q) qb.andWhere("(CAST(guild.id AS TEXT) ILIKE :q OR guild.name ILIKE :q)", { q });

    const [guilds, total] = await qb.orderBy("guild.discovery_weight", "DESC").addOrderBy("guild.member_count", "DESC").take(options.limit).skip(options.offset).getManyAndCount();

    return paginated(guilds.map(toAdminDiscoveryGuild), total, options);
}

export async function getAdminDiscoveryGuild(guildId: string, includeExcluded: boolean): Promise<AdminDiscoveryGuild> {
    const qb = Guild.createQueryBuilder("guild").where("guild.id = :guildId", { guildId }).andWhere(":feature = ANY(guild.features)", { feature: "DISCOVERABLE" });

    if (!includeExcluded) qb.andWhere("guild.discovery_excluded = false");

    const guild = await qb.getOne();
    if (!guild) notFound("Discovery guild");

    return toAdminDiscoveryGuild(guild);
}

export function getAdminConfiguration(): AdminConfiguration {
    return toAdminConfiguration();
}

export async function listAdminStickers(options: AdminListOptions) {
    const qb = Sticker.createQueryBuilder("sticker");
    const q = search(options.q);

    if (q) {
        qb.where("(CAST(sticker.id AS TEXT) ILIKE :q OR sticker.name ILIKE :q OR CAST(sticker.guild_id AS TEXT) ILIKE :q OR CAST(sticker.user_id AS TEXT) ILIKE :q)", { q });
    }

    const [stickers, total] = await qb.orderBy("sticker.id", "DESC").take(options.limit).skip(options.offset).getManyAndCount();

    return paginated(stickers.map(toAdminSticker), total, options);
}

export async function listAdminUserAttachments(userId: string, options: AdminListOptions) {
    const base = Attachment.createQueryBuilder("attachment").innerJoin("attachment.message", "message").where("message.author_id = :userId", { userId });
    const q = search(options.q);

    if (q) {
        base.andWhere(
            "(CAST(attachment.id AS TEXT) ILIKE :q OR attachment.filename ILIKE :q OR CAST(attachment.message_id AS TEXT) ILIKE :q OR CAST(attachment.channel_id AS TEXT) ILIKE :q OR attachment.content_type ILIKE :q)",
            { q },
        );
    }

    const [rows, total] = await Promise.all([
        base
            .clone()
            .select("attachment.id", "id")
            .addSelect("attachment.filename", "filename")
            .addSelect("attachment.size", "size")
            .addSelect("attachment.height", "height")
            .addSelect("attachment.width", "width")
            .addSelect("attachment.content_type", "contentType")
            .addSelect("attachment.message_id", "messageId")
            .addSelect("attachment.channel_id", "channelId")
            .addSelect("message.author_id", "authorId")
            .addSelect("message.guild_id", "guildId")
            .addSelect("message.timestamp", "timestamp")
            .orderBy("attachment.id", "DESC")
            .limit(options.limit)
            .offset(options.offset)
            .getRawMany<AdminAttachmentRow>(),
        base.clone().getCount(),
    ]);

    return paginated(rows.map(toAdminAttachment), total, options);
}
