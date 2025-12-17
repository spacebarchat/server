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

import { BitField } from "./BitField";

export class Intents extends BitField {
	static FLAGS = {
		GUILDS: BigInt(1) << BigInt(0), // guilds and guild merge-split events affecting the user
		GUILD_MEMBERS: BigInt(1) << BigInt(1), // memberships
		GUILD_MODERATION: BigInt(1) << BigInt(2), // bans and ban lists
		GUILD_EXPRESSIONS: BigInt(1) << BigInt(3), // custom emojis
		GUILD_INTEGRATIONS: BigInt(1) << BigInt(4), // applications
		GUILD_WEBHOOKS: BigInt(1) << BigInt(5), // webhooks
		GUILD_INVITES: BigInt(1) << BigInt(6), // mass invites (no user can receive user specific invites of another user)
		GUILD_VOICE_STATES: BigInt(1) << BigInt(7), // voice updates
		GUILD_PRESENCES: BigInt(1) << BigInt(8), // presence updates
		GUILD_MESSAGES: BigInt(1) << BigInt(9), // guild message metadata
		GUILD_MESSAGE_REACTIONS: BigInt(1) << BigInt(10), // guild message reactions
		GUILD_MESSAGE_TYPING: BigInt(1) << BigInt(11), // guild channel typing notifications
		DIRECT_MESSAGES: BigInt(1) << BigInt(12), // DM or orphan channels
		DIRECT_MESSAGE_REACTIONS: BigInt(1) << BigInt(13), // DM or orphan channel message reactions
		DIRECT_MESSAGE_TYPING: BigInt(1) << BigInt(14), // DM typing notifications
		GUILD_MESSAGES_CONTENT: BigInt(1) << BigInt(15), // guild message content
		AUTO_MODERATION_CONFIGURATION: BigInt(1) << BigInt(20), // guild policies
		AUTO_MODERATION_EXECUTION: BigInt(1) << BigInt(21), // guild policy execution
	};

	static ERKINALP_FLAGS = {
		LIVE_MESSAGE_COMPOSITION: BigInt(1) << BigInt(32), // allow composing messages using the gateway
		GUILD_ROUTES: BigInt(1) << BigInt(41), // message routes affecting the guild
		DIRECT_MESSAGES_THREADS: BigInt(1) << BigInt(42), // direct message threads
		JUMBO_EVENTS: BigInt(1) << BigInt(43), // jumbo events (size limits to be defined later)
		LOBBIES: BigInt(1) << BigInt(44), // lobbies
		INSTANCE_ROUTES: BigInt(1) << BigInt(60), // all message route changes
		INSTANCE_GUILD_CHANGES: BigInt(1) << BigInt(61), // all guild create, guild object patch, split, merge and delete events
		INSTANCE_POLICY_UPDATES: BigInt(1) << BigInt(62), // all instance policy updates
		INSTANCE_USER_UPDATES: BigInt(1) << BigInt(63), // all instance user updates
	};

	static PRIVILEGED_FLAGS: BitField = new Intents(Intents.FLAGS.GUILD_PRESENCES | Intents.FLAGS.GUILD_MEMBERS | Intents.FLAGS.GUILD_MESSAGES_CONTENT);

	static INTENT_TO_EVENTS_MAP = {
		// MESSAGE_CONTENT
		15: [],
		// TODO: aren't these guild specific?
		// AUTO_MODERATION_CONFIGURATION
		20: ["AUTO_MODERATION_RULE_CREATE", "AUTO_MODERATION_RULE_UPDATE", "AUTO_MODERATION_RULE_DELETE"],
		// AUTO_MODERATION_EXECUTION
		21: ["AUTO_MODERATION_ACTION_EXECUTION"],
	};

	static GUILD_INTENT_TO_EVENTS_MAP = {
		// GUILDS
		0: [
			"GUILD_CREATE",
			"GUILD_UPDATE",
			"GUILD_DELETE",
			"GUILD_ROLE_CREATE",
			"GUILD_ROLE_UPDATE",
			"GUILD_ROLE_DELETE",
			"CHANNEL_CREATE",
			"CHANNEL_UPDATE",
			"CHANNEL_DELETE",
			"CHANNEL_PINS_UPDATE",
			"THREAD_CREATE",
			"THREAD_UPDATE",
			"THREAD_DELETE",
			"THREAD_LIST_SYNC",
			"THREAD_MEMBER_UPDATE",
			"THREAD_MEMBERS_UPDATE", // *
			"STAGE_INSTANCE_CREATE",
			"STAGE_INSTANCE_UPDATE",
			"STAGE_INSTANCE_DELETE",
		],
		// GUILD_MEMBERS
		1: [
			"GUILD_MEMBER_ADD",
			"GUILD_MEMBER_UPDATE",
			"GUILD_MEMBER_REMOVE",
			"THREAD_MEMBERS_UPDATE ", // *
		],
		// GUILD_BANS
		2: ["GUILD_AUDIT_LOG_ENTRY_CREATE", "GUILD_BAN_ADD", "GUILD_BAN_REMOVE"],
		// GUILD_EXPRESSIONS
		3: [
			"GUILD_EMOJIS_UPDATE",
			"GUILD_STICKERS_UPDATE",
			"GUILD_SOUNDBOARD_SOUND_CREATE",
			"GUILD_SOUNDBOARD_SOUND_UPDATE",
			"GUILD_SOUNDBOARD_SOUND_DELETE",
			"GUILD_SOUNDBOARD_SOUNDS_UPDATE",
		],
		// GUILD_INTEGRATIONS
		4: ["GUILD_INTEGRATIONS_UPDATE", "INTEGRATION_CREATE", "INTEGRATION_UPDATE", "INTEGRATION_DELETE"],
		// GUILD_WEBHOOKS
		5: ["WEBHOOKS_UPDATE"],
		// GUILD_INVITES
		6: ["GUILD_INVITE_CREATE", "GUILD_INVITE_DELETE"],
		// GUILD_VOICE_STATES
		7: ["VOICE_CHANNEL_EFFECT_SEND", "VOICE_STATE_UPDATE"],
		// GUILD_PRESENCES
		8: ["PRESENCE_UPDATE"],
		// GUILD_MESSAGES
		9: ["MESSAGE_CREATE", "MESSAGE_UPDATE", "MESSAGE_DELETE", "MESSAGE_DELETE_BULK"],
		// GUILD_MESSAGE_REACTIONS
		10: ["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE", "MESSAGE_REACTION_REMOVE_ALL", "MESSAGE_REACTION_REMOVE_EMOJI"],
		// GUILD_MESSAGE_TYPING
		11: ["TYPING_START"],
		// GUILD_SCHEDULED_EVENTS
		16: ["GUILD_SCHEDULED_EVENT_CREATE", "GUILD_SCHEDULED_EVENT_UPDATE", "GUILD_SCHEDULED_EVENT_DELETE", "GUILD_SCHEDULED_EVENT_USER_ADD", "GUILD_SCHEDULED_EVENT_USER_REMOVE"],
		// GUILD_MESSAGE_POLLS
		24: ["MESSAGE_POLL_VOTE_ADD", "MESSAGE_POLL_VOTE_REMOVE"],
	};
	static DM_INTENT_TO_EVENTS_MAP = {
		// DIRECT_MESSAGES
		12: ["MESSAGE_CREATE", "MESSAGE_UPDATE", "MESSAGE_DELETE", "CHANNEL_PINS_UPDATE"],
		// DIRECT_MESSAGE_REACTIONS
		13: ["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE", "MESSAGE_REACTION_REMOVE_ALL", "MESSAGE_REACTION_REMOVE_EMOJI"],
		// DIRECT_MESSAGE_TYPING
		14: ["TYPING_START"],
		// DIRECT_MESSAGE_POLLS
		25: ["MESSAGE_POLL_VOTE_ADD", "MESSAGE_POLL_VOTE_REMOVE"],
	};
}
