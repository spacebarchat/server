"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermission = exports.Permissions = void 0;
// https://github.com/discordjs/discord.js/blob/master/src/util/Permissions.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
const Member_1 = require("../models/Member");
const Channel_1 = require("../models/Channel");
const Role_1 = require("../models/Role");
const BitField_1 = require("./BitField");
const Guild_1 = require("../models/Guild");
const CUSTOM_PERMISSION_OFFSET = 1n << 48n; // 16 free custom permission bits, and 16 for discord to add new ones
class Permissions extends BitField_1.BitField {
    any(permission, checkAdmin = true) {
        return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.any(permission);
    }
    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     */
    has(permission, checkAdmin = true) {
        return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.has(permission);
    }
    static channelPermission(overwrites, init) {
        // TODO: do not deny any permissions if admin
        return overwrites.reduce((permission, overwrite) => {
            // apply disallowed permission
            // * permission: current calculated permission (e.g. 010)
            // * deny contains all denied permissions (e.g. 011)
            // * allow contains all explicitly allowed permisions (e.g. 100)
            return (permission & ~overwrite.deny) | overwrite.allow;
            // ~ operator inverts deny (e.g. 011 -> 100)
            // & operator only allows 1 for both ~deny and permission (e.g. 010 & 100 -> 000)
            // | operators adds both together (e.g. 000 + 100 -> 100)
        }, 0n ?? init);
    }
    static rolePermission(roles) {
        // adds all permissions of all roles together (Bit OR)
        return roles.reduce((permission, role) => permission | role.permissions, 0n);
    }
    static finalPermission({ user, guild, channel, }) {
        let roles = guild.roles.filter((x) => user.roles.includes(x.id));
        let permission = Permissions.rolePermission(roles);
        if (channel?.overwrites) {
            let overwrites = channel.overwrites.filter((x) => {
                if (x.type === 0 && user.roles.includes(x.id))
                    return true;
                if (x.type === 1 && x.id == user.id)
                    return true;
                return false;
            });
            permission = Permissions.channelPermission(overwrites, permission);
        }
        return permission;
    }
}
exports.Permissions = Permissions;
Permissions.FLAGS = {
    CREATE_INSTANT_INVITE: 1n << 0n,
    KICK_MEMBERS: 1n << 1n,
    BAN_MEMBERS: 1n << 2n,
    ADMINISTRATOR: 1n << 3n,
    MANAGE_CHANNELS: 1n << 4n,
    MANAGE_GUILD: 1n << 5n,
    ADD_REACTIONS: 1n << 6n,
    VIEW_AUDIT_LOG: 1n << 7n,
    PRIORITY_SPEAKER: 1n << 8n,
    STREAM: 1n << 9n,
    VIEW_CHANNEL: 1n << 10n,
    SEND_MESSAGES: 1n << 11n,
    SEND_TTS_MESSAGES: 1n << 12n,
    MANAGE_MESSAGES: 1n << 13n,
    EMBED_LINKS: 1n << 14n,
    ATTACH_FILES: 1n << 15n,
    READ_MESSAGE_HISTORY: 1n << 16n,
    MENTION_EVERYONE: 1n << 17n,
    USE_EXTERNAL_EMOJIS: 1n << 18n,
    VIEW_GUILD_INSIGHTS: 1n << 19n,
    CONNECT: 1n << 20n,
    SPEAK: 1n << 21n,
    MUTE_MEMBERS: 1n << 22n,
    DEAFEN_MEMBERS: 1n << 23n,
    MOVE_MEMBERS: 1n << 24n,
    USE_VAD: 1n << 25n,
    CHANGE_NICKNAME: 1n << 26n,
    MANAGE_NICKNAMES: 1n << 27n,
    MANAGE_ROLES: 1n << 28n,
    MANAGE_WEBHOOKS: 1n << 29n,
    MANAGE_EMOJIS: 1n << 30n,
};
async function getPermission(user_id, guild_id, channel_id, cache) {
    var { channel, member } = cache || {};
    const guild = await Guild_1.GuildModel.findOne({ id: guild_id }, { owner_id: true }).exec();
    if (!guild)
        throw new Error("Guild not found");
    if (guild.owner_id === user_id)
        return new Permissions("ADMINISTRATOR");
    member = await Member_1.MemberModel.findOne({ guild_id, id: user_id }, "roles").exec();
    if (!member)
        throw new Error("Member not found");
    var roles = await Role_1.RoleModel.find({ guild_id, id: { $in: member.roles } }).exec();
    if (channel_id) {
        channel = await Channel_1.ChannelModel.findOne({ id: channel_id }, "permission_overwrites").exec();
    }
    var permission = Permissions.finalPermission({
        user: {
            id: user_id,
            roles: member.roles,
        },
        guild: {
            roles: roles,
        },
        channel: {
            overwrites: channel?.permission_overwrites,
        },
    });
    return new Permissions(permission);
}
exports.getPermission = getPermission;
//# sourceMappingURL=Permissions.js.map