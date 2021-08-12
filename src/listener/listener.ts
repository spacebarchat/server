import {
	db,
	Event,
	MongooseCache,
	UserModel,
	getPermission,
	Permissions,
	ChannelModel,
	RabbitMQ,
	EVENT,
} from "@fosscord/server-util";
import { OPCODES } from "../util/Constants";
import { Send } from "../util/Send";
import WebSocket from "../util/WebSocket";
import "missing-native-js-functions";
import { ConsumeMessage } from "amqplib";

// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.
// ? How to resubscribe MongooseCache for new dm channel events? Maybe directly send them to the user_id regardless of the channel_id? -> max overhead of creating 10 events in database for dm user group. Or a new field in event -> recipient_ids?

// Sharding: calculate if the current shard id matches the formula: shard_id = (guild_id >> 22) % num_shards
// https://discord.com/developers/docs/topics/gateway#sharding

export interface DispatchOpts {
	eventStream: MongooseCache;
	guilds: Array<string>;
}

function getPipeline(this: WebSocket, guilds: string[], channels: string[] = []) {
	if (this.shard_count) {
		guilds = guilds.filter((x) => (BigInt(x) >> 22n) % this.shard_count! === this.shard_id);
	}

	return [
		{
			$match: {
				$or: [
					{ "fullDocument.guild_id": { $in: guilds } },
					{ "fullDocument.user_id": this.user_id },
					{ "fullDocument.channel_id": { $in: channels } },
				],
			},
		},
	];
}

// TODO: use already required guilds/channels of Identify and don't fetch them again
export async function setupListener(this: WebSocket) {
	const user = await UserModel.findOne({ id: this.user_id }, { guilds: true }).exec();
	const channels = await ChannelModel.find(
		{ $or: [{ recipient_ids: this.user_id }, { guild_id: { $in: user.guilds } }] },
		{ id: true, permission_overwrites: true }
	).exec();
	const dm_channels = channels.filter((x) => !x.guild_id);
	const guild_channels = channels.filter((x) => x.guild_id);

	if (RabbitMQ.connection) {
		this.rabbitCh = await RabbitMQ.connection.createChannel();
		this.rabbitCh!.assertQueue(this.user_id).then(() => this.rabbitCh!.consume(this.user_id, consume.bind(this)));

		for (const channel of dm_channels) {
			this.rabbitCh!.assertQueue(channel.id).then(() => this.rabbitCh!.consume(channel.id, consume.bind(this)));
		}
		for (const guild of user.guilds) {
			// contains guild and dm channels

			getPermission(this.user_id, guild)
				.then((x) => {
					this.permissions[guild] = x;
					this.rabbitCh!.assertQueue(guild).then(() => this.rabbitCh!.consume(guild, consume.bind(this)));
					for (const channel of guild_channels) {
						if (x.overwriteChannel(channel.permission_overwrites).has("VIEW_CHANNEL")) {
							this.rabbitCh!.assertQueue(channel.id).then(() =>
								this.rabbitCh!.consume(channel.id, consume.bind(this))
							);
						}
					}
				})
				.catch((e) => {});
		}

		this.once("close", () => {
			this.rabbitCh!.close();
		});
	} else {
		const eventStream = new MongooseCache(
			db.collection("events"),
			getPipeline.call(
				this,
				user.guilds,
				channels.map((x) => x.id)
			),
			{
				onlyEvents: true,
			}
		);

		await eventStream.init();
		eventStream.on("insert", (document: Event) =>
			dispatch.call(this, document, { eventStream, guilds: user.guilds })
		);

		this.once("close", () => eventStream.destroy());
	}
}

// TODO: use rabbitmq to only receive events that are included in intents
function consume(this: WebSocket, opts: ConsumeMessage | null) {
	if (!opts) return;
	if (!this.rabbitCh) return;
	const data = JSON.parse(opts.content.toString());
	const id = data.id as string;
	const event = opts.properties.type as EVENT;
	const permission = this.permissions[id] || new Permissions("ADMINISTRATOR"); // default permission for dm

	console.log("rabbitmq event", event);

	// subscription managment
	switch (event) {
		case "CHANNEL_DELETE":
		case "GUILD_DELETE":
			this.rabbitCh.cancel(id);
			break;
		case "CHANNEL_CREATE":
		// TODO: check if user has permission to channel
		case "GUILD_CREATE":
			this.rabbitCh!.assertQueue(id).then(() => this.rabbitCh!.consume(id, consume.bind(this)));
			break;
		case "CHANNEL_UPDATE":
			// @ts-ignore
			const exists = this.rabbitCh.consumers[id];
			if (permission.overwriteChannel(data.permission_overwrites).has("VIEW_CHANNEL")) {
				if (exists) break;
				this.rabbitCh!.assertQueue(id).then(() => this.rabbitCh!.consume(id, consume.bind(this)));
			} else {
				if (!exists) break;
				this.rabbitCh.cancel(id);
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

	Send(this, {
		op: OPCODES.Dispatch,
		t: event,
		d: data,
		s: this.sequence++,
	});
	this.rabbitCh.ack(opts);
}

// TODO: cache permission
// we shouldn't fetch the permission for every event, as a message send event with many channel members would result in many thousand db queries.
// instead we should calculate all (guild, channel) permissions once and dynamically update if it changes.
// TODO: only subscribe for events that are in the connection intents
// TODO: only subscribe for channel/guilds that the user has access to (and re-subscribe if it changes)

export async function dispatch(this: WebSocket, document: Event, { eventStream, guilds }: DispatchOpts) {
	var permission = new Permissions("ADMINISTRATOR"); // default permission for dms
	console.log("event", document);
	var channel_id = document.channel_id || document.data?.channel_id;
	// TODO: clean up
	if (document.event === "GUILD_CREATE") {
		guilds.push(document.data.id);
		eventStream.changeStream(getPipeline.call(this, guilds));
	} else if (document.event === "GUILD_DELETE") {
		guilds.remove(document.guild_id!);
		eventStream.changeStream(getPipeline.call(this, guilds));
	} else if (document.event === "CHANNEL_DELETE") channel_id = null;
	if (document.guild_id && !this.intents.has("GUILDS")) return;

	try {
		permission = await getPermission(this.user_id, document.guild_id, channel_id);
	} catch (e) {
		permission = new Permissions();
	}

	// check intents: https://discord.com/developers/docs/topics/gateway#gateway-intents
	switch (document.event) {
		case "GUILD_DELETE":
		case "GUILD_CREATE":
		case "GUILD_UPDATE":
		case "GUILD_ROLE_CREATE":
		case "GUILD_ROLE_UPDATE":
		case "GUILD_ROLE_DELETE":
		case "CHANNEL_CREATE":
		case "CHANNEL_DELETE":
		case "CHANNEL_UPDATE":
			// gets sent if GUILDS intent is set (already checked in if document.guild_id)
			break;
		case "GUILD_INTEGRATIONS_UPDATE":
			if (!this.intents.has("GUILD_INTEGRATIONS")) return;
			break;
		case "WEBHOOKS_UPDATE":
			if (!this.intents.has("GUILD_WEBHOOKS")) return;
			break;
		case "GUILD_EMOJI_UPDATE":
			if (!this.intents.has("GUILD_EMOJIS")) return;
			break;
		// only send them, if the user subscribed for this part of the member list, or is a bot
		case "GUILD_MEMBER_ADD":
		case "GUILD_MEMBER_REMOVE":
		case "GUILD_MEMBER_UPDATE":
			if (!this.intents.has("GUILD_MEMBERS")) return;
			break;
		case "VOICE_STATE_UPDATE":
			if (!this.intents.has("GUILD_VOICE_STATES")) return;
			break;
		case "GUILD_BAN_ADD":
		case "GUILD_BAN_REMOVE":
			if (!this.intents.has("GUILD_BANS")) return;
			break;
		case "INVITE_CREATE":
		case "INVITE_DELETE":
			if (!this.intents.has("GUILD_INVITES")) return;
		case "PRESENCE_UPDATE":
			if (!this.intents.has("GUILD_PRESENCES")) return;
			break;
		case "MESSAGE_CREATE":
		case "MESSAGE_DELETE":
		case "MESSAGE_DELETE_BULK":
		case "MESSAGE_UPDATE":
		case "CHANNEL_PINS_UPDATE":
			if (!this.intents.has("GUILD_MESSAGES") && document.guild_id) return;
			if (!this.intents.has("DIRECT_MESSAGES") && !document.guild_id) return;
			break;
		case "MESSAGE_REACTION_ADD":
		case "MESSAGE_REACTION_REMOVE":
		case "MESSAGE_REACTION_REMOVE_ALL":
		case "MESSAGE_REACTION_REMOVE_EMOJI":
			if (!this.intents.has("GUILD_MESSAGE_REACTIONS") && document.guild_id) return;
			if (!this.intents.has("DIRECT_MESSAGE_REACTIONS") && !document.guild_id) return;
			break;

		case "TYPING_START":
			if (!this.intents.has("GUILD_MESSAGE_TYPING") && document.guild_id) return;
			if (!this.intents.has("DIRECT_MESSAGE_TYPING") && !document.guild_id) return;
			break;
		case "READY": // will be sent by the gateway
		case "USER_UPDATE":
		case "APPLICATION_COMMAND_CREATE":
		case "APPLICATION_COMMAND_DELETE":
		case "APPLICATION_COMMAND_UPDATE":
		default:
			// Any events not defined in an intent are considered "passthrough" and will always be sent to you.
			break;
	}

	// check permissions
	switch (document.event) {
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
			break;
		case "GUILD_BAN_ADD":
		case "GUILD_BAN_REMOVE":
			if (!permission.has("BAN_MEMBERS")) break;
			break;
		case "INVITE_CREATE":
		case "INVITE_DELETE":
			if (!permission.has("MANAGE_GUILD")) break;
		case "PRESENCE_UPDATE":
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

	return Send(this, {
		op: OPCODES.Dispatch,
		t: document.event,
		d: document.data,
		s: this.sequence++,
	});
}
