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
    getPermission,
    Permissions,
    RabbitMQ,
    listenEvent,
    EventOpts,
    ListenEventOpts,
    Member,
    EVENTEnum,
    Relationship,
    Message,
    NewUrlUserSignatureData,
    GuildMemberAddEvent,
    Ban,
} from "@spacebar/util";
import { OPCODES, CLOSECODES } from "../util/Constants";
import { Send } from "../util/Send";
import { WebSocket } from "@spacebar/gateway";
import { Channel as AMQChannel } from "amqplib";
import { Recipient } from "@spacebar/util";
import * as console from "node:console";
import { PublicMember, RelationshipType } from "@spacebar/schemas";
import { bgRedBright } from "picocolors";

// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.

// Sharding: calculate if the current shard id matches the formula: shard_id = (guild_id >> 22) % num_shards
// https://discord.com/developers/docs/topics/gateway#sharding

export function handlePresenceUpdate(this: WebSocket, { event, acknowledge, data }: EventOpts) {
    acknowledge?.();
    if (event === EVENTEnum.PresenceUpdate) {
        return Send(this, {
            op: OPCODES.Dispatch,
            t: event,
            d: data,
            s: this.sequence++,
        });
    }
}

// TODO: use already queried guilds/channels of Identify and don't fetch them again
export async function setupListener(this: WebSocket) {
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
        try {
            if (RabbitMQ.connection) {
                console.log(`[RabbitMQ] [user-${this.user_id}] Setting up channel and event listeners`);
                opts.channel = await RabbitMQ.connection.createChannel();

                opts.channel.on("error", handleChannelError);
                opts.channel.queues = {};
                console.log("[RabbitMQ] channel created: ", typeof opts.channel, "with channel id", opts.channel?.ch);
            }

            try {
                this.events[this.user_id] = await listenEvent(this.user_id, consumer, opts);
            } catch (error) {
                console.error(`[Gateway] Failed to set up user event listener for ${this.user_id}:`, error);
                throw error;
            }

            const relationshipPromises = relationships.map(async (relationship) => {
                try {
                    this.events[relationship.to_id] = await listenEvent(relationship.to_id, handlePresenceUpdate.bind(this), opts);
                } catch (error) {
                    console.error(`[Gateway] Failed to set up relationship event listener for ${relationship.to_id}:`, error);
                    // continue with other listeners even if one fails
                }
            });

            const dmPromises = dm_channels.map(async (channel) => {
                try {
                    this.events[channel.id] = await listenEvent(channel.id, consumer, opts);
                } catch (error) {
                    console.error(`[Gateway] Failed to set up DM channel event listener for ${channel.id}:`, error);
                    // continue with other listeners even if one fails
                }
            });

            const guildPromises = guilds.map(async (guild) => {
                try {
                    const permission = await getPermission(this.user_id, guild.id);
                    this.permissions[guild.id] = permission;
                    this.events[guild.id] = await listenEvent(guild.id, consumer, opts);

                    // channel event listeners for this guild
                    const channelPromises = guild.channels.map(async (channel) => {
                        if (permission.overwriteChannel(channel.permission_overwrites ?? []).has("VIEW_CHANNEL")) {
                            try {
                                this.events[channel.id] = await listenEvent(channel.id, consumer, opts);
                            } catch (error) {
                                console.error(`[Gateway] Failed to set up guild channel event listener for ${channel.id}:`, error);
                                // continue with other channels even if one fails
                            }
                        }
                    });

                    await Promise.all(channelPromises);
                } catch (error) {
                    console.error(`[Gateway] Failed to set up guild event listener for ${guild.id}:`, error);
                    // continue with other guilds even if one fails
                }
            });

            await Promise.all([...relationshipPromises, ...dmPromises, ...guildPromises]);

            console.log(`[Gateway] Event listeners setup completed for user ${this.user_id}`);
        } catch (error) {
            console.error(`[Gateway] Critical failure setting up event listeners for user ${this.user_id}:`, error);
            throw error;
        }
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
    let eventName: string = "unknown";
    try {
        const { data, event } = opts;
        eventName = event;
        const id = data.id as string;
        const permission = this.permissions[id] || new Permissions("ADMINISTRATOR"); // default permission for dm

        const consumer = consume.bind(this);
        const listenOpts = opts as ListenEventOpts;
        opts.acknowledge?.();
        // console.log("event", event);

        // subscription managment
        switch (event) {
            case "GUILD_MEMBER_REMOVE":
                this.member_events[data.user.id]?.();
                delete this.member_events[data.user.id];
                break;
            case "GUILD_MEMBER_ADD":
                if (this.member_events[data.user.id]) break; // already subscribed
                this.member_events[data.user.id] = await listenEvent(data.user.id, handlePresenceUpdate.bind(this), this.listen_options);
                break;
            case "GUILD_MEMBER_UPDATE":
                if (!this.member_events[data.user.id]) break;
                this.member_events[data.user.id]();
                break;
            case "RELATIONSHIP_REMOVE":
            case "CHANNEL_DELETE":
            case "GUILD_DELETE":
                this.events[id]?.();
                delete this.events[id];
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
            case "CHANNEL_CREATE":
                if (!permission.overwriteChannel(data.permission_overwrites).has("VIEW_CHANNEL")) return;
                this.events[id] = await listenEvent(id, consumer, listenOpts);
                break;
            case "RELATIONSHIP_ADD":
                this.events[data.user.id] = await listenEvent(data.user.id, handlePresenceUpdate.bind(this), this.listen_options);
                break;
            case "GUILD_CREATE":
                Promise.all([
                    ...data.channels.map(async ({ id }: { id: string }) => {
                        this.events[id] = await listenEvent(id, consumer, listenOpts);
                    }),
                    listenEvent(id, consumer, listenOpts).then((ret) => (this.events[id] = ret)),
                ]);
                break;
            case "CHANNEL_UPDATE": {
                const exists = this.events[id];
                if (permission.overwriteChannel(data.permission_overwrites).has("VIEW_CHANNEL")) {
                    if (exists) break;
                    this.events[id] = await listenEvent(id, consumer, listenOpts);
                } else {
                    if (!exists) return; // return -> do not send channel update events for hidden channels
                    opts.cancel(id);
                    delete this.events[id];
                }
                break;
            }
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
            case "MESSAGE_UPDATE":
                // console.log(this.request)
                if (data["attachments"])
                    data["attachments"] = Message.prototype.withSignedAttachments.call(
                        data,
                        new NewUrlUserSignatureData({
                            ip: this.ipAddress,
                            userAgent: this.userAgent,
                        }),
                    ).attachments;
                break;
            default:
                break;
        }

        if (event === "GUILD_MEMBER_ADD") {
            if ((data as PublicMember).roles === undefined || (data as PublicMember).roles === null) {
                console.log(bgRedBright("[Gateway]"), "[GUILD_MEMBER_ADD] roles is undefined, setting to empty array!", opts.origin ?? "(Event origin not defined)", data);
                (data as PublicMember).roles = [];
            }
        }

        await Send(this, {
            op: OPCODES.Dispatch,
            t: event,
            d: data,
            s: this.sequence++,
        }).catch((sendError) => {
            console.error(`[Gateway] Failed to send event ${event} to user ${this.user_id}:`, sendError);
            this.isHealthy = false;
            this.close(CLOSECODES.Unknown_error, "Failed to send event");
        });
    } catch (error) {
        console.error(`[Gateway] Unhandled error in event consumer for user ${this.user_id}, event ${eventName}:`, error);
        this.isHealthy = false;
        // let health check handle it or allow client to reconnect
    }
}
