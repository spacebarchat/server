/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
    Ban,
    EVENTEnum,
    EventOpts,
    getPermission,
    listenEvent,
    ListenEventOpts,
    Member,
    Message,
    NewUrlUserSignatureData,
    Permissions,
    RabbitMQ,
    Recipient,
    Relationship,
    Role,
} from "@spacebar/util";
import { CLOSECODES, OPCODES, Send } from "../util";
import { WebSocket } from "@spacebar/gateway";
import { Channel as AMQChannel } from "amqplib";
import { PublicChannel, PublicMember, RelationshipType } from "@spacebar/schemas";
import { bgRedBright } from "picocolors";
import {
    getEventRouteId,
    hasGuildMemberEventId,
    isEventRouteSubscribed,
    trackGuildEventId,
    trackGuildMemberEventId,
    untrackGuildEventId,
    unsubscribeEventIds,
    unsubscribeGuildEventIds,
    unsubscribeGuildMemberEventIds,
} from "./subscriptions";

type GuildCreatePermissionData = {
    id: string;
    owner_id?: string;
    roles?: Array<Pick<Role, "id" | "permissions">>;
    members?: Array<
        PublicMember & {
            id?: string;
            communication_disabled_until?: Date | string | null;
            user?: PublicMember["user"] & {
                flags?: number;
                public_flags?: number;
            };
        }
    >;
};

// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.

// Sharding: calculate if the current shard id matches the formula: shard_id = (guild_id >> 22) % num_shards
// https://discord.com/developers/docs/topics/gateway#sharding

export function handlePresenceUpdate(this: WebSocket, opts: EventOpts) {
    const { event, acknowledge, data } = opts;
    acknowledge?.();
    if (!isEventRouteSubscribed(this.events, opts) && !isEventRouteSubscribed(this.member_events, opts)) return;

    if (event === EVENTEnum.PresenceUpdate) {
        return Send(this, {
            op: OPCODES.Dispatch,
            t: event,
            d: data,
            s: this.sequence++,
        });
    }
}

async function subscribeEvent(this: WebSocket, eventId: string, callback: (event: EventOpts) => unknown, opts: ListenEventOpts, guildId?: string) {
    if (this.events[eventId]) {
        if (guildId) trackGuildEventId(this.guild_event_ids, guildId, eventId);
        return;
    }

    const unsubscribe = await listenEvent(eventId, callback, opts);

    if (guildId && !this.permissions[guildId]) {
        await unsubscribe();
        return;
    }

    if (this.events[eventId]) {
        await unsubscribe();
        if (guildId) trackGuildEventId(this.guild_event_ids, guildId, eventId);
        return;
    }

    this.events[eventId] = unsubscribe;
    if (guildId) trackGuildEventId(this.guild_event_ids, guildId, eventId);
}

export async function subscribeGuildMemberEvent(this: WebSocket, guildId: string, userId: string) {
    if (hasGuildMemberEventId(this.guild_member_event_ids, guildId, userId)) return false;

    if (this.member_events[userId]) {
        trackGuildMemberEventId(this.guild_member_event_ids, this.member_event_guild_ids, guildId, userId);
        return false;
    }

    if (this.events[userId]) return false; // already subscribed as friend

    trackGuildMemberEventId(this.guild_member_event_ids, this.member_event_guild_ids, guildId, userId);
    const unsubscribe = await listenEvent(userId, handlePresenceUpdate.bind(this), this.listen_options);

    if (!hasGuildMemberEventId(this.guild_member_event_ids, guildId, userId)) {
        await unsubscribe();
        return false;
    }

    if (this.member_events[userId]) {
        await unsubscribe();
        return false;
    }

    this.member_events[userId] = unsubscribe;
    return true;
}

function getGuildCreatePermission(userId: string, guild: GuildCreatePermissionData) {
    const member = guild.members?.find((member) => member.user?.id === userId || member.id === userId);
    const roleIds = member?.roles?.length ? member.roles : [guild.id];
    const roles = (guild.roles ?? []).filter((role) => roleIds.includes(role.id)) as Role[];
    const userFlags = member?.user?.flags ?? member?.user?.public_flags ?? 0;

    const permission = Permissions.finalPermission({
        user: {
            id: userId,
            roles: roleIds,
            communication_disabled_until: member?.communication_disabled_until ? new Date(member.communication_disabled_until) : null,
            flags: userFlags,
        },
        guild: {
            id: guild.id,
            owner_id: guild.owner_id ?? "",
            roles,
        },
    });

    permission.cache = { roles, user_id: userId };

    return permission;
}

// TODO: use already queried guilds/channels of Identify and don't fetch them again
export async function setupListener(this: WebSocket) {
    const opts: {
        acknowledge: boolean;
        channel?: AMQChannel & { queues?: unknown; ch?: number };
    } = {
        acknowledge: true,
    };
    this.listen_options = opts;
    const consumer = consume.bind(this);

    const handleChannelError = (err: unknown) => {
        console.error(`[RabbitMQ] [user-${this.user_id}] Channel Error (Handled):`, err);
    };

    // Function to set up all event listeners (used for initial setup and reconnection)
    const setupEventListeners = async () => {
        const [members, recipients, relationships] = await Promise.all([
            Member.find({
                where: { id: this.user_id },
                relations: { guild: { channels: true } },
            }),
            Recipient.find({
                where: { user_id: this.user_id, closed: false },
                relations: { channel: true },
            }),
            Relationship.find({
                where: {
                    from_id: this.user_id,
                    type: RelationshipType.friends,
                },
            }),
        ]);

        const guilds = members.map((x) => x.guild);
        const dm_channels = recipients.map((x) => x.channel);

        if (RabbitMQ.connection) {
            console.log(`[RabbitMQ] [user-${this.user_id}] Setting up channel and event listeners`);
            opts.channel = await RabbitMQ.connection.createChannel();

            opts.channel.on("error", handleChannelError);
            opts.channel.queues = {};
            console.log("[RabbitMQ] channel created: ", typeof opts.channel, "with channel id", opts.channel?.ch);
        }

        await subscribeEvent.call(this, this.user_id, consumer, opts);
        await subscribeEvent.call(this, this.session_id, consumer, opts);

        await Promise.all(
            relationships.map(async (relationship) => {
                await subscribeEvent.call(this, relationship.to_id, handlePresenceUpdate.bind(this), opts);
            }),
        );

        await Promise.all(
            dm_channels.map(async (channel) => {
                await subscribeEvent.call(this, channel.id, consumer, opts);
            }),
        );

        await Promise.all(
            guilds.map(async (guild) => {
                const permission = await getPermission(this.user_id, guild.id);
                this.permissions[guild.id] = permission;
                await subscribeEvent.call(this, guild.id, consumer, opts, guild.id);

                await Promise.all(
                    guild.channels.map(async (channel) => {
                        if (permission.overwriteChannel(channel.permission_overwrites ?? []).has("VIEW_CHANNEL")) {
                            await subscribeEvent.call(this, channel.id, consumer, opts, guild.id);
                        }
                    }),
                );
            }),
        );
    };

    // Initial setup
    await setupEventListeners();

    // Handle RabbitMQ reconnection - re-establish all subscriptions
    const handleReconnect = async () => {
        console.log(`[RabbitMQ] [user-${this.user_id}] Connection restored, re-establishing subscriptions`);
        try {
            // Clear old event handlers (they're now invalid)
            this.events = {};
            this.member_events = {};
            this.guild_event_ids = {};
            this.guild_member_event_ids = {};
            this.member_event_guild_ids = {};
            this.permissions = {};
            opts.channel = undefined;

            // re-establish all subscriptions
            await setupEventListeners();
            console.log(`[RabbitMQ] [user-${this.user_id}] Successfully re-established subscriptions`);
        } catch (e) {
            console.error(`[RabbitMQ] [user-${this.user_id}] Failed to re-establish subscriptions:`, e);
            // close the WebSocket - will force client to reconnect and redo subscription setup
            this.close(4000, "Failed to re-establish event subscriptions");
        }
    };

    const handleDisconnect = () => {
        console.log(`[RabbitMQ] [user-${this.user_id}] Connection lost, waiting for reconnection`);
        // mark channel invalid
        if (opts.channel) {
            opts.channel.off("error", handleChannelError);
        }
        opts.channel = undefined;
    };

    // Subscribe to RabbitMQ connection events
    RabbitMQ.on("reconnected", handleReconnect);
    RabbitMQ.on("disconnected", handleDisconnect);

    this.once("close", async () => {
        // Unsubscribe from RabbitMQ events
        RabbitMQ.off("reconnected", handleReconnect);
        RabbitMQ.off("disconnected", handleDisconnect);

        // wait for event consumer cancellation
        await Promise.all(
            Object.values(this.events).map((x) => {
                if (x) return x();
                else return Promise.resolve();
            }),
        );
        await Promise.all(Object.values(this.member_events).map((x) => x()));

        if (opts.channel) {
            try {
                await opts.channel.close();
            } catch {
                // Channel might already be closed
            }
            opts.channel.off("error", handleChannelError);
        }
    });
}

// TODO: only subscribe for events that are in the connection intents
async function consume(this: WebSocket, opts: EventOpts) {
    const { data, event } = opts;
    const id = data.id as string;
    const guildId = data.guild_id as string | undefined;
    const permission = (guildId && this.permissions[guildId]) || this.permissions[id] || new Permissions("ADMINISTRATOR"); // default permission for dm

    const consumer = consume.bind(this);
    const listenOpts = opts as ListenEventOpts;
    opts.acknowledge?.();
    const eventRouteId = getEventRouteId(opts);
    if (eventRouteId && !this.events[eventRouteId]) return;
    // console.log("event", event);

    // deduplicate gateway messages
    if (opts.transaction_id) {
        if (this.recentTransactions.includes(opts.transaction_id)) return;
        this.recentTransactions.push(opts.transaction_id);
        if (this.recentTransactions.length > 100) this.recentTransactions = this.recentTransactions.slice(1);
    }

    // special codes
    switch (event) {
        case "SB_SESSION_CLOSE":
            // TODO: what do we even send here?
            await Send(this, {
                op: OPCODES.Reconnect,
                s: this.sequence++,
                d: opts.reconnect_delay ?? opts.data ?? 1000,
            });
            this.close(1000); // not a discord close code, standard WS "Normal Closure"
            return;
        case "SB_SESSION_REMOVE":
            // TODO: what do we even send here?
            await Send(this, {
                op: OPCODES.Invalid_Session,
                s: this.sequence++,
            });
            this.close(CLOSECODES.Invalid_session); // TODO: this is deprecated?
            return;
        default:
            // no special treatment
            break;
    }

    // subscription managment
    switch (event) {
        case "GUILD_MEMBER_REMOVE":
            if (!guildId) break;
            await unsubscribeGuildMemberEventIds(this.member_events, this.guild_member_event_ids, this.member_event_guild_ids, guildId, [data.user.id]);
            break;
        case "GUILD_MEMBER_ADD":
            if (!guildId) break;
            await subscribeGuildMemberEvent.call(this, guildId, data.user.id);
            break;
        case "GUILD_MEMBER_UPDATE":
            if (!guildId) break;
            await unsubscribeGuildMemberEventIds(this.member_events, this.guild_member_event_ids, this.member_event_guild_ids, guildId, [data.user.id]);
            break;
        case "RELATIONSHIP_REMOVE":
            await unsubscribeEventIds(this.events, [id]);
            break;
        case "CHANNEL_DELETE":
            untrackGuildEventId(this.guild_event_ids, guildId, id);
            await unsubscribeEventIds(this.events, [id]);
            break;
        case "GUILD_DELETE": {
            delete this.permissions[id];
            await Promise.all([
                unsubscribeGuildEventIds(this.events, this.guild_event_ids, id),
                unsubscribeGuildMemberEventIds(this.member_events, this.guild_member_event_ids, this.member_event_guild_ids, id),
            ]);
            if (event === "GUILD_DELETE" && this.ipAddress) {
                const ban = await Ban.findOne({
                    where: { guild_id: id, user_id: this.user_id },
                });

                if (ban) {
                    ban.ip = this.ipAddress || undefined;
                    await ban.save();
                }
            }
            break;
        }
        case "CHANNEL_CREATE":
            if (!permission.overwriteChannel(data.permission_overwrites).has("VIEW_CHANNEL")) return;
            await subscribeEvent.call(this, id, consumer, listenOpts, guildId);
            break;
        case "RELATIONSHIP_ADD":
            await subscribeEvent.call(this, data.user.id, handlePresenceUpdate.bind(this), this.listen_options);
            break;
        case "GUILD_CREATE": {
            const guildPermission = getGuildCreatePermission(this.user_id, data as GuildCreatePermissionData);
            this.permissions[id] = guildPermission;
            await Promise.all([
                ...((data.channels ?? []) as PublicChannel[]).map(async (channel) => {
                    if (!guildPermission.overwriteChannel(channel.permission_overwrites ?? []).has("VIEW_CHANNEL")) return;
                    await subscribeEvent.call(this, channel.id, consumer, listenOpts, id);
                }),
                subscribeEvent.call(this, id, consumer, listenOpts, id),
            ]);
            break;
        }
        case "CHANNEL_UPDATE": {
            const exists = this.events[id];
            if (permission.overwriteChannel(data.permission_overwrites).has("VIEW_CHANNEL")) {
                if (exists) break;
                await subscribeEvent.call(this, id, consumer, listenOpts, guildId);
            } else {
                if (!exists) return; // return -> do not send channel update events for hidden channels
                untrackGuildEventId(this.guild_event_ids, guildId, id);
                await unsubscribeEventIds(this.events, [id]);
            }
            break;
        }
        default:
            // no special treatment
            break;
    }

    // permission checking
    switch (event) {
        case "INVITE_CREATE":
        case "INVITE_DELETE":
        case "GUILD_INTEGRATIONS_UPDATE":
            if (!permission.has("MANAGE_GUILD")) return;
            break;
        case "WEBHOOKS_UPDATE":
            if (!permission.has("MANAGE_WEBHOOKS")) return;
            break;
        case "GUILD_MEMBER_ADD":
        case "GUILD_MEMBER_REMOVE":
        case "GUILD_MEMBER_UPDATE": // only send them, if the user subscribed for this part of the member list, or is a bot
        case "PRESENCE_UPDATE": // exception if user is friend
            break;
        case "GUILD_BAN_ADD":
        case "GUILD_BAN_REMOVE":
            if (!permission.has("BAN_MEMBERS")) return;
            break;
        case "VOICE_STATE_UPDATE":
        case "MESSAGE_CREATE":
        case "MESSAGE_DELETE":
        case "MESSAGE_DELETE_BULK":
        case "MESSAGE_UPDATE":
        case "CHANNEL_PINS_UPDATE":
        case "MESSAGE_REACTION_ADD":
        case "MESSAGE_REACTION_REMOVE":
        case "MESSAGE_REACTION_REMOVE_ALL":
        case "MESSAGE_REACTION_REMOVE_EMOJI":
        case "TYPING_START":
            // only gets send if the user is alowed to view the current channel
            if (!permission.has("VIEW_CHANNEL")) return;
            break;
        case "GUILD_CREATE":
        case "GUILD_DELETE":
        case "GUILD_UPDATE":
        case "GUILD_ROLE_CREATE":
        case "GUILD_ROLE_UPDATE":
        case "GUILD_ROLE_DELETE":
        case "CHANNEL_CREATE":
        case "CHANNEL_DELETE":
        case "CHANNEL_UPDATE":
        case "GUILD_EMOJI_UPDATE":
        case "GUILD_EMOJIS_UPDATE":
        case "READY": // will be sent by the gateway
        case "USER_UPDATE":
        case "APPLICATION_COMMAND_CREATE":
        case "APPLICATION_COMMAND_DELETE":
        case "APPLICATION_COMMAND_UPDATE":
        default:
            // always gets sent
            // Any events not defined in an intent are considered "passthrough" and will always be sent
            break;
    }

    // data rewrites, e.g. signed attachment URLs
    switch (event) {
        case "MESSAGE_CREATE":
        case "MESSAGE_UPDATE": {
            const signedMessage = Message.prototype.withSignedAttachments.call(
                data,
                new NewUrlUserSignatureData({
                    ip: this.ipAddress,
                    userAgent: this.userAgent,
                }),
            );
            Object.assign(data, signedMessage);
            break;
        }
        default:
            break;
    }

    if (event === "GUILD_MEMBER_ADD") {
        if ((data as PublicMember).roles === undefined || (data as PublicMember).roles === null) {
            console.log(
                bgRedBright(`[Gateway/${this.user_id}]`),
                "[GUILD_MEMBER_ADD] roles is undefined, setting to empty array!",
                opts.origin ?? "(Event origin not defined)",
                data,
            );
            (data as PublicMember).roles = [];
        }
    }

    await Send(this, {
        op: OPCODES.Dispatch,
        t: event,
        d: data,
        s: this.sequence++,
    });
}
