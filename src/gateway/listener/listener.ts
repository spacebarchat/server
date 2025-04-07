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
	RelationshipType,
} from "@spacebar/util";
import { OPCODES } from "../util/Constants";
import { Send } from "../util/Send";
import { WebSocket } from "@spacebar/gateway";
import "missing-native-js-functions";
import { Channel as AMQChannel } from "amqplib";
import { Recipient } from "@spacebar/util";
import * as console from "node:console";

// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.

// Sharding: calculate if the current shard id matches the formula: shard_id = (guild_id >> 22) % num_shards
// https://discord.com/developers/docs/topics/gateway#sharding

export function handlePresenceUpdate(
	this: WebSocket,
	{ event, acknowledge, data }: EventOpts,
) {
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
			relations: ["guild", "guild.channels"],
		}),
		Recipient.find({
			where: { user_id: this.user_id, closed: false },
			relations: ["channel"],
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

	console.log("[RabbitMQ] setupListener: open for ", this.user_id);
	if (RabbitMQ.connection) {
		console.log(
			"[RabbitMQ] setupListener: opts.channel = ",
			typeof opts.channel,
			"with channel id",
			opts.channel?.ch,
		);
		opts.channel = await RabbitMQ.connection.createChannel();
		opts.channel.queues = {};
		console.log(
			"[RabbitMQ] channel created: ",
			typeof opts.channel,
			"with channel id",
			opts.channel?.ch,
		);
	}

	this.events[this.user_id] = await listenEvent(this.user_id, consumer, opts);

	relationships.forEach(async (relationship) => {
		this.events[relationship.to_id] = await listenEvent(
			relationship.to_id,
			handlePresenceUpdate.bind(this),
			opts,
		);
	});

	dm_channels.forEach(async (channel) => {
		this.events[channel.id] = await listenEvent(channel.id, consumer, opts);
	});

	guilds.forEach(async (guild) => {
		const permission = await getPermission(this.user_id, guild.id);
		this.permissions[guild.id] = permission;
		this.events[guild.id] = await listenEvent(guild.id, consumer, opts);

		guild.channels.forEach(async (channel) => {
			if (
				permission
					.overwriteChannel(channel.permission_overwrites ?? [])
					.has("VIEW_CHANNEL")
			) {
				this.events[channel.id] = await listenEvent(
					channel.id,
					consumer,
					opts,
				);
			}
		});
	});

	this.once("close", () => {
		console.log(
			"[RabbitMQ] setupListener: close for",
			this.user_id,
			"=",
			typeof opts.channel,
			"with channel id",
			opts.channel?.ch,
		);
		if (opts.channel) opts.channel.close();
		else {
			Object.values(this.events).forEach((x) => x?.());
			Object.values(this.member_events).forEach((x) => x());
		}
	});
}

// TODO: only subscribe for events that are in the connection intents
async function consume(this: WebSocket, opts: EventOpts) {
	const { data, event } = opts;
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
			this.member_events[data.user.id] = await listenEvent(
				data.user.id,
				handlePresenceUpdate.bind(this),
				this.listen_options,
			);
			break;
		case "GUILD_MEMBER_UPDATE":
			if (!this.member_events[data.user.id]) break;
			this.member_events[data.user.id]();
			break;
		case "RELATIONSHIP_REMOVE":
		case "CHANNEL_DELETE":
		case "GUILD_DELETE":
			delete this.events[id];
			opts.cancel();
			break;
		case "CHANNEL_CREATE":
			if (
				!permission
					.overwriteChannel(data.permission_overwrites)
					.has("VIEW_CHANNEL")
			) {
				return;
			}
			this.events[id] = await listenEvent(id, consumer, listenOpts);
			break;
		case "RELATIONSHIP_ADD":
			this.events[data.user.id] = await listenEvent(
				data.user.id,
				handlePresenceUpdate.bind(this),
				this.listen_options,
			);
			break;
		case "GUILD_CREATE":
			this.events[id] = await listenEvent(id, consumer, listenOpts);
			break;
		case "CHANNEL_UPDATE": {
			const exists = this.events[id];
			if (
				permission
					.overwriteChannel(data.permission_overwrites)
					.has("VIEW_CHANNEL")
			) {
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

	await Send(this, {
		op: OPCODES.Dispatch,
		t: event,
		d: data,
		s: this.sequence++,
	});
}
