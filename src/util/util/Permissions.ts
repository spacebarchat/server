// https://github.com/discordjs/discord.js/blob/master/src/util/Permissions.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
// @fc-license-skip

import { Channel, Guild, Member, Role, User } from "../entities";
import { BitField, BitFieldResolvable, BitFlag } from "./BitField";
import { HTTPError } from "lambert-server";
import { ChannelPermissionOverwrite, ChannelPermissionOverwriteType, ChannelType, UserFlags } from "@spacebar/schemas";
import { FindOneOptions } from "typeorm";

export type PermissionResolvable = bigint | number | Permissions | PermissionResolvable[] | PermissionString;

type PermissionString = keyof typeof Permissions.FLAGS;

// BigInt doesn't have a bit limit (https://stackoverflow.com/questions/53335545/whats-the-biggest-bigint-value-in-js-as-per-spec)
// const CUSTOM_PERMISSION_OFFSET = BigInt(1) << BigInt(64); // 27 permission bits left for discord to add new ones

export class Permissions extends BitField {
    cache: PermissionCache = {};

    constructor(bits: BitFieldResolvable = 0) {
        super(bits);
        if (this.bitfield & Permissions.FLAGS.ADMINISTRATOR) {
            this.bitfield = Permissions.ALL_PERMISSIONS;
        }
    }

    static FLAGS = {
        CREATE_INSTANT_INVITE: BitFlag(0),
        KICK_MEMBERS: BitFlag(1),
        BAN_MEMBERS: BitFlag(2),
        ADMINISTRATOR: BitFlag(3),
        MANAGE_CHANNELS: BitFlag(4),
        MANAGE_GUILD: BitFlag(5),
        ADD_REACTIONS: BitFlag(6),
        VIEW_AUDIT_LOG: BitFlag(7),
        PRIORITY_SPEAKER: BitFlag(8),
        STREAM: BitFlag(9),
        VIEW_CHANNEL: BitFlag(10),
        SEND_MESSAGES: BitFlag(11),
        SEND_TTS_MESSAGES: BitFlag(12),
        MANAGE_MESSAGES: BitFlag(13),
        EMBED_LINKS: BitFlag(14),
        ATTACH_FILES: BitFlag(15),
        READ_MESSAGE_HISTORY: BitFlag(16),
        MENTION_EVERYONE: BitFlag(17),
        USE_EXTERNAL_EMOJIS: BitFlag(18),
        VIEW_GUILD_INSIGHTS: BitFlag(19),
        CONNECT: BitFlag(20),
        SPEAK: BitFlag(21),
        MUTE_MEMBERS: BitFlag(22),
        DEAFEN_MEMBERS: BitFlag(23),
        MOVE_MEMBERS: BitFlag(24),
        USE_VAD: BitFlag(25),
        CHANGE_NICKNAME: BitFlag(26),
        MANAGE_NICKNAMES: BitFlag(27),
        MANAGE_ROLES: BitFlag(28),
        MANAGE_WEBHOOKS: BitFlag(29),
        MANAGE_EMOJIS_AND_STICKERS: BitFlag(30),
        USE_APPLICATION_COMMANDS: BitFlag(31),
        REQUEST_TO_SPEAK: BitFlag(32),
        MANAGE_EVENTS: BitFlag(33),
        MANAGE_THREADS: BitFlag(34),
        CREATE_PUBLIC_THREADS: BitFlag(35),
        CREATE_PRIVATE_THREADS: BitFlag(36),
        USE_EXTERNAL_STICKERS: BitFlag(37),
        SEND_MESSAGES_IN_THREADS: BitFlag(38),
        USE_EMBEDDED_ACTIVITIES: BitFlag(39),
        MODERATE_MEMBERS: BitFlag(40),
        VIEW_CREATOR_MONETIZATION_ANALYTICS: BitFlag(41),
        USE_SOUNDBOARD: BitFlag(42),
        CREATE_GUILD_EXPRESSIONS: BitFlag(43),
        CREATE_EVENTS: BitFlag(44),
        USE_EXTERNAL_SOUNDS: BitFlag(45),
        SEND_VOICE_MESSAGES: BitFlag(46),
        DEPRECATED_USE_CLYDE_AI: BitFlag(47), // DEPRECATED
        SET_VOICE_CHANNEL_STATUS: BitFlag(48),
        SEND_POLLS: BitFlag(49),
        USE_EXTERNAL_APPS: BitFlag(50),
        PIN_MESSAGES: BitFlag(51),
        BYPASS_SLOWMODE: BitFlag(52),

        /**
         * CUSTOM PERMISSIONS ideas:
         * - allow user to dm members
         * - allow user to pin messages (without MANAGE_MESSAGES)
         * - allow user to publish messages (without MANAGE_MESSAGES)
         */
        // CUSTOM_PERMISSION: BigInt(1) << BigInt(0) + CUSTOM_PERMISSION_OFFSET
    };

    static ALL_PERMISSIONS = Object.values(Permissions.FLAGS).reduce((total, val) => total | val, BigInt(0));

    any(permission: PermissionResolvable, checkAdmin = true) {
        return (checkAdmin && super.any(Permissions.FLAGS.ADMINISTRATOR)) || super.any(permission);
    }

    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     */
    has(permission: PermissionResolvable, checkAdmin = true) {
        return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.has(permission);
    }

    /**
     * Checks whether the bitfield has a permission, or multiple permissions, but throws an Error if user fails to match auth criteria.
     */
    hasThrow(permission: PermissionResolvable) {
        if (this.has(permission) && this.has("VIEW_CHANNEL")) return true;
        throw new HTTPError(`You are missing the following permissions ${permission}`, 403);
    }

    overwriteChannel(overwrites: ChannelPermissionOverwrite[]) {
        if (!overwrites) return this;
        if (!this.cache) throw new Error("permission cache not available");
        overwrites = overwrites.filter((x) => {
            if (x.type === ChannelPermissionOverwriteType.role && this.cache.roles?.some((r) => r.id === x.id)) return true;
            if (x.type === ChannelPermissionOverwriteType.member && x.id == this.cache.user_id) return true;
            return false;
        });
        return new Permissions(Permissions.channelPermission(overwrites, this.bitfield));
    }

    static channelPermission(overwrites: ChannelPermissionOverwrite[], init?: bigint) {
        // TODO: do not deny any permissions if admin
        return overwrites.reduce(
            (permission, overwrite) => {
                // apply disallowed permission
                // * permission: current calculated permission (e.g. 010)
                // * deny contains all denied permissions (e.g. 011)
                // * allow contains all explicitly allowed permisions (e.g. 100)
                return (permission & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow);
                // ~ operator inverts deny (e.g. 011 -> 100)
                // & operator only allows 1 for both ~deny and permission (e.g. 010 & 100 -> 000)
                // | operators adds both together (e.g. 000 + 100 -> 100)
            },
            init || BigInt(0),
        );
    }

    static rolePermission(roles: Role[]) {
        // adds all permissions of all roles together (Bit OR)
        return roles.reduce((permission, role) => permission | BigInt(role.permissions || "0"), BigInt(0));
    }

    static finalPermission({
        user,
        guild,
        channel,
    }: {
        user: { id: string; roles: string[]; communication_disabled_until: Date | null; flags: number };
        guild: { id: string; owner_id: string; roles: Role[] };
        channel?: {
            overwrites?: ChannelPermissionOverwrite[];
            recipient_ids?: string[] | null;
            owner_id?: string;
        };
    }) {
        if (user.id === "0") return new Permissions("ADMINISTRATOR"); // system user id
        if (guild?.owner_id === user.id) return new Permissions(Permissions.ALL);

        const roles = guild.roles.filter((x) => user.roles.includes(x.id));
        let permission = Permissions.rolePermission(roles);

        if (channel?.overwrites) {
            const overwrites = channel.overwrites.filter((x) => {
                if (x.type === ChannelPermissionOverwriteType.role && user.roles.includes(x.id)) return true;
                if (x.type === ChannelPermissionOverwriteType.member && x.id == user.id) return true;
                return false;
            });
            permission = Permissions.channelPermission(overwrites, permission);
        }

        if (channel?.recipient_ids) {
            if (channel?.owner_id === user.id) return new Permissions("ADMINISTRATOR");
            if (channel.recipient_ids.includes(user.id)) {
                // Default dm permissions
                return new Permissions([
                    "VIEW_CHANNEL",
                    "SEND_MESSAGES",
                    "STREAM",
                    "ADD_REACTIONS",
                    "EMBED_LINKS",
                    "ATTACH_FILES",
                    "READ_MESSAGE_HISTORY",
                    "MENTION_EVERYONE",
                    "USE_EXTERNAL_EMOJIS",
                    "CONNECT",
                    "SPEAK",
                    "MANAGE_CHANNELS",
                ]);
            }

            return new Permissions();
        }

        if (user.communication_disabled_until) {
            if (user.communication_disabled_until > new Date()) return new Permissions(permission & Permissions.TIMED_OUT_MASK.bitfield);
            else {
                user.communication_disabled_until = null;
                Member.update({ id: user.id, guild_id: guild.id }, { communication_disabled_until: null }).catch((_) => {
                    // ignored
                });
            }
        }
        if ((BigInt(user.flags) & UserFlags.FLAGS.QUARANTINED) === UserFlags.FLAGS.QUARANTINED) {
            permission = permission & Permissions.QUARANTINED_MASK.bitfield;
        }

        return new Permissions(permission);
    }

    static NONE: Permissions = new Permissions(0);
    static TIMED_OUT_MASK: Permissions = new Permissions(Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.READ_MESSAGE_HISTORY);
    static QUARANTINED_MASK: Permissions = new Permissions(Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.READ_MESSAGE_HISTORY | Permissions.FLAGS.CHANGE_NICKNAME);
    static DEFAULT_DM_PERMISSIONS: Permissions = new Permissions(
        Permissions.FLAGS.VIEW_CHANNEL |
            Permissions.FLAGS.SEND_MESSAGES |
            Permissions.FLAGS.STREAM |
            Permissions.FLAGS.ADD_REACTIONS |
            Permissions.FLAGS.EMBED_LINKS |
            Permissions.FLAGS.ATTACH_FILES |
            Permissions.FLAGS.READ_MESSAGE_HISTORY |
            Permissions.FLAGS.MENTION_EVERYONE |
            Permissions.FLAGS.USE_EXTERNAL_EMOJIS |
            Permissions.FLAGS.CONNECT |
            Permissions.FLAGS.SPEAK |
            Permissions.FLAGS.MANAGE_CHANNELS,
    );
    static ALL: Permissions = new Permissions(Object.values(Permissions.FLAGS).reduce((total, val) => total | val, BigInt(0)));
}

export type PermissionCache = {
    channel?: Channel | undefined;
    member?: Member | undefined;
    guild?: Guild | undefined;
    roles?: Role[] | undefined;
    user_id?: string;
};

export async function getPermission(
    user_id?: string,
    guild_id?: string | Guild,
    channel_id?: string | Channel,
    opts: {
        guild_select?: (keyof Guild)[];
        guild_relations?: string[];
        channel_select?: (keyof Channel)[];
        channel_relations?: string[];
        member_select?: (keyof Member)[];
        member_relations?: string[];
    } = {},
) {
    if (!user_id) throw new HTTPError("User not found");
    let channel: Channel | undefined;
    let member: Member | undefined;
    let guild: Guild | undefined;
    const user = await User.findOneOrFail({
        where: { id: user_id },
        select: { id: true, flags: true },
    });
    const query = {
        relations: ["recipients", "thread_members", "thread_members.member", ...(opts.channel_relations || [])],
        select: ["type", "parent_id", "id", "recipients", "permission_overwrites", "owner_id", "guild_id", ...(opts.channel_select || [])],
    } as FindOneOptions<Channel>;
    if (typeof channel_id === "string") {
        channel = await Channel.findOneOrFail({ where: { id: channel_id }, ...query });
        if (channel.guild_id) guild_id = channel.guild_id; // derive guild_id from the channel
    } else if (channel_id) {
        channel = channel_id;
    }
    while (channel?.isThread() && channel.parent_id) {
        const parent = await Channel.findOneOrFail({ where: { id: channel.parent_id }, ...query });
        if (channel.type === ChannelType.GUILD_PRIVATE_THREAD) {
            if (!parent.thread_members!.find(({ member }) => member.id === user_id)) {
                const perms: Permissions = await getPermission(user_id, guild_id, parent, opts);
                if (!perms.has("MANAGE_THREADS")) {
                    return new Permissions(0);
                } else {
                    return perms;
                }
            }
        }
        channel = parent;
    }

    if (guild_id) {
        if (typeof guild_id === "string") {
            guild = await Guild.findOneOrFail({
                where: { id: guild_id },
                select: ["id", "owner_id", ...(opts.guild_select || [])],
                relations: opts.guild_relations,
            });
        } else {
            guild = guild_id;
        }
        if (guild.owner_id === user_id) return new Permissions(Permissions.FLAGS.ADMINISTRATOR);

        member = await Member.findOneOrFail({
            where: { guild_id: guild.id, id: user_id },
            relations: ["roles", ...(opts.member_relations || [])],
            // select: [
            // "id",		// TODO: Bug in typeorm? adding these selects breaks the query.
            // "roles",
            // "communication_disabled_until",
            // ...(opts.member_select || []),
            // ],
        });
    }

    let recipient_ids = channel?.recipients?.map((x) => x.user_id);
    if (!recipient_ids?.length) recipient_ids = undefined;

    // TODO: remove guild.roles and convert recipient_ids to recipients
    const permission = Permissions.finalPermission({
        user: {
            id: user_id,
            roles: member?.roles.map((x) => x.id) || [],
            communication_disabled_until: member?.communication_disabled_until ?? null,
            flags: user.flags,
        },
        guild: {
            id: guild?.id || "",
            owner_id: guild?.owner_id || "",
            roles: member?.roles || [],
        },
        channel: {
            overwrites: channel?.permission_overwrites,
            owner_id: channel?.owner_id,
            recipient_ids,
        },
    });

    const obj = new Permissions(permission);

    // pass cache to permission for possible future getPermission calls
    obj.cache = { guild, member, channel, roles: member?.roles, user_id };

    return obj;
}
