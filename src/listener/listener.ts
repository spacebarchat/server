import { db, Event, MongooseCache, UserModel, getPermission, Permissions } from "fosscord-server-util";
import WebSocket from "../util/WebSocket";

// TODO: bot sharding
// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.
// ? How to resubscribe MongooseCache for new dm channel events? Maybe directly send them to the user_id regardless of the channel_id? -> max overhead of creating 10 events in database for dm user group. Or a new field in event -> recipient_ids?

export async function setupListener(this: WebSocket) {
	const user = await UserModel.findOne({ id: this.userid }).exec();

	const eventStream = new MongooseCache(
		db.collection("events"),
		[{ $match: { $or: [{ guild_id: { $in: user.guilds } }, { user_id: this.userid }] } }],
		{ onlyEvents: true }
	);
	await eventStream.init();
	eventStream.on("insert", dispatch.bind(this));

	this.once("close", () => eventStream.destroy());
}

export async function dispatch(this: WebSocket, document: Event) {
	var permission = new Permissions("ADMINISTRATOR"); // default permission for dms

	if (document.guild_id) {
		if (!this.intents.has("GUILDS")) return;
		const channel_id = document.channel_id || document.data?.channel_id;
		permission = new Permissions(await getPermission(this.userid, document.guild_id, channel_id));
	}

	console.log("event", document);

	// check intents: https://discord.com/developers/docs/topics/gateway#gateway-intents
	switch (document.event) {
		case "GUILD_CREATE":
		case "GUILD_DELETE":
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
		case "READY":
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
		case "READY":
		case "USER_UPDATE":
		case "APPLICATION_COMMAND_CREATE":
		case "APPLICATION_COMMAND_DELETE":
		case "APPLICATION_COMMAND_UPDATE":
		default:
			// always gets sent
			// Any events not defined in an intent are considered "passthrough" and will always be sent
			break;
	}

	return this.emit(document.event, document.data);
}
