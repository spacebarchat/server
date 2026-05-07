import { Channel, ChannelDeleteEvent, ChannelUpdateEvent, Event, Guild, Member, Role, Snowflake, emitEvent, User } from "@spacebar/util";
import { ChannelType } from "@spacebar/schemas";
import { HTTPError } from "lambert-server";
import { AdminDiscoveryGuild, toAdminDiscoveryGuild } from "./dto";
import { assertAdminChannelDeletionSupported, createAdminThreadDeleteEvent, parseAdminDiscoveryGuildUpdate, parseAdminForceJoinInput } from "./mutationPolicy";

export type AdminEventEmitter = (payload: Omit<Event, "created_at">) => Promise<void>;

export interface AdminChannelDeleteResult {
    id: string;
    guildId: string | null;
    event: "CHANNEL_DELETE" | "THREAD_DELETE";
    detachedChildChannelIds: string[];
}

export interface AdminForceJoinResult {
    guildId: string;
    userId: string;
    joined: boolean;
    madeOwner: boolean;
    madeAdmin: boolean;
    adminRoleId: string | null;
}

function notFound(entity: string): never {
    throw new HTTPError(`${entity} not found`, 404);
}

export async function updateAdminDiscoveryGuild(guildId: string, body: unknown, includeExcluded: boolean): Promise<AdminDiscoveryGuild> {
    const update = parseAdminDiscoveryGuildUpdate(body);
    const qb = Guild.createQueryBuilder("guild").where("guild.id = :guildId", { guildId }).andWhere(":feature = ANY(guild.features)", { feature: "DISCOVERABLE" });

    if (!includeExcluded) qb.andWhere("guild.discovery_excluded = false");

    const guild = await qb.getOne();
    if (!guild) notFound("Discovery guild");

    if (update.discoveryExcluded !== undefined) guild.discovery_excluded = update.discoveryExcluded;
    if (update.discoveryWeight !== undefined) guild.discovery_weight = update.discoveryWeight;

    await guild.save();

    return toAdminDiscoveryGuild(guild);
}

export async function deleteAdminChannel(channelId: string, emitter: AdminEventEmitter = emitEvent): Promise<AdminChannelDeleteResult> {
    const channel = await Channel.findOne({ where: { id: channelId } });
    if (!channel) notFound("Channel");

    assertAdminChannelDeletionSupported(channel);

    if (channel.isThread()) {
        await Channel.delete({ id: channel.id });
        await emitter(createAdminThreadDeleteEvent(channel));

        return {
            id: channel.id,
            guildId: channel.guild_id ?? null,
            event: "THREAD_DELETE",
            detachedChildChannelIds: [],
        };
    }

    const detachedChildChannelIds: string[] = [];
    if (channel.type === ChannelType.GUILD_CATEGORY) {
        const children = await Channel.find({ where: { parent_id: channel.id } });
        for (const child of children) {
            child.parent_id = null;
            await child.save();
            detachedChildChannelIds.push(child.id);
            await emitter({
                event: "CHANNEL_UPDATE",
                data: child.toJSON(),
                channel_id: child.id,
            } satisfies Omit<ChannelUpdateEvent, "created_at">);
        }
    }

    await Channel.deleteChannel(channel);
    await emitter({
        event: "CHANNEL_DELETE",
        data: channel.toJSON(),
        channel_id: channel.id,
    } satisfies Omit<ChannelDeleteEvent, "created_at">);

    return {
        id: channel.id,
        guildId: channel.guild_id ?? null,
        event: "CHANNEL_DELETE",
        detachedChildChannelIds,
    };
}

async function findOrCreateAdminRole(guildId: string) {
    const roles = await Role.find({ where: { guild_id: guildId }, order: { position: "ASC" } });
    const existing = roles.find((role) => role.permissions === "8" || role.permissions === "9");
    if (existing) return existing;

    const maxPosition = roles.reduce((max, role) => Math.max(max, role.position), 0);
    return Role.create({
        id: Snowflake.generate(),
        guild_id: guildId,
        name: "Instance administrator",
        color: 0,
        colors: { primary_color: 0 },
        hoist: false,
        position: maxPosition + 1,
        permissions: "8",
        managed: false,
        mentionable: false,
        flags: 0,
    }).save();
}

export async function forceJoinAdminGuild(guildId: string, body: unknown, actorUserId: string): Promise<AdminForceJoinResult> {
    const input = parseAdminForceJoinInput(body);
    const userId = input.userId ?? actorUserId;

    const [guild, user] = await Promise.all([Guild.findOne({ where: { id: guildId } }), User.findOne({ where: { id: userId } })]);
    if (!guild) notFound("Guild");
    if (!user) notFound("User");

    let joined = false;
    let member = await Member.findOne({ where: { id: userId, guild_id: guildId }, relations: { roles: true } });
    if (!member) {
        await Member.addToGuild(userId, guildId);
        joined = true;
        member = await Member.findOneOrFail({ where: { id: userId, guild_id: guildId }, relations: { roles: true } });
    }

    let adminRoleId: string | null = null;
    if (input.makeOwner) {
        guild.owner_id = userId;
        await guild.save();
    } else if (input.makeAdmin) {
        const adminRole = await findOrCreateAdminRole(guildId);
        adminRoleId = adminRole.id;

        if (!member.roles?.some((role) => role.id === adminRole.id)) {
            await Member.addRole(userId, guildId, adminRole.id);
        }
    }

    return {
        guildId,
        userId,
        joined,
        madeOwner: input.makeOwner,
        madeAdmin: input.makeAdmin,
        adminRoleId,
    };
}
