import {
	User,
	getPermission,
	Permissions,
	Channel,
	RabbitMQ,
	listenEvent,
	EventOpts,
	ListenEventOpts,
	Member,
} from "@fosscord/util";
import { OPCODES } from "@fosscord/gateway/util/Constants";
import { Send } from "@fosscord/gateway/util/Send";
import WebSocket from "@fosscord/gateway/util/WebSocket";
import "missing-native-js-functions";
import { Channel as AMQChannel } from "amqplib";
import { In, Like } from "typeorm";
import { Recipient } from "@fosscord/util";

// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.

// Sharding: calculate if the current shard id matches the formula: shard_id = (guild_id >> 22) % num_shards
// https://discord.com/developers/docs/topics/gateway#sharding

// TODO: use already queried guilds/channels of Identify and don't fetch them again
export async function setupListener(this: WebSocket) {
	const members = await Member.find({
		where: { id: this.user_id },
		relations: ["guild", "guild.channels"],
	});
	const guilds = members.map((x) => x.guild);
	const recipients = await Recipient.find({
		where: { user_id: this.user_id },
		relations: ["channel"],
	});
	const dm_channels = recipients.map((x) => x.channel);

	const opts: { acknowledge: boolean; channel?: AMQChannel } = {
		acknowledge: true,
	};
	const consumer = consume.bind(this);

	if (RabbitMQ.connection) {
		opts.channel = await RabbitMQ.connection.createChannel();
		// @ts-ignore
		opts.channel.queues = {};
	}

	this.events[this.user_id] = await listenEvent(this.user_id, consumer, opts);

	for (const channel of dm_channels) {
		this.events[channel.id] = await listenEvent(channel.id, consumer, opts);
	}

	for (const guild of guilds) {
		// contains guild and dm channels

		getPermission(this.user_id, guild.id)
			.then(async (x) => {
				this.permissions[guild.id] = x;
				this.listeners;
				this.events[guild.id] = await listenEvent(
					guild.id,
					consumer,
					opts
				);

				for (const channel of guild.channels) {
					if (
						x
							.overwriteChannel(channel.permission_overwrites!)
							.has("VIEW_CHANNEL")
					) {
						this.events[channel.id] = await listenEvent(
							channel.id,
							consumer,
							opts
						);
					}
				}
			})
			.catch((e) =>
				console.log("couldn't get permission for guild " + guild, e)
			);
	}

	this.once("close", () => {
		if (opts.channel) opts.channel.close();
		else Object.values(this.events).forEach((x) => x());
	});
}

// TODO: only subscribe for events that are in the connection intents
async function consume(this: WebSocket, opts: EventOpts) {
	const { data, event } = opts;
	const id = data.id as string;
	const permission = this.permissions[id] || new Permissions("ADMINISTRATOR"); // default permission for dm

	const consumer = consume.bind(this);
	const listenOpts = opts as ListenEventOpts;
	// console.log("event", event);

	// subscription managment
	switch (event) {
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
			)
				return;
			break;
		case "GUILD_CREATE":
			this.events[id] = await listenEvent(id, consumer, listenOpts);
			break;
		case "CHANNEL_UPDATE":
			const exists = this.events[id];
			// @ts-ignore
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
		case "GUILD_MEMBER_UPDATE":
		// only send them, if the user subscribed for this part of the member list, or is a bot
		case "PRESENCE_UPDATE": // exception if user is friend
			break;
		case "GUILD_BAN_ADD":
		case "GUILD_BAN_REMOVE":
			if (!permission.has("BAN_MEMBERS")) break;
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

	let aa = {
		op: OPCODES.Dispatch,
		t: event,
		d: data,
		s: this.sequence++,
	}

	//TODO remove before PR merge
	console.log(aa)

	Send(this, aa);
	opts.acknowledge?.();
}
