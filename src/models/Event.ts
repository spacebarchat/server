import { ConnectedAccount, User, UserSettings } from "./User";
import { DMChannel, Channel } from "./Channel";
import { Guild } from "./Guild";
import { PublicMember, UserGuildSettings } from "./Member";
import { Emoji } from "./Emoji";
import { Presence } from "./Activity";
import { Role } from "./Role";
import { Invite } from "./Invite";
import { Message, PartialEmoji } from "./Message";
import { VoiceState } from "./VoiceState";
import { ApplicationCommand } from "./Application";
import { Interaction } from "./Interaction";
import { Schema, model, Types, Document } from "mongoose";

export interface Event {
	guild_id?: bigint;
	user_id?: bigint;
	channel_id?: bigint;
	created_at?: number;
	event: EVENT;
	data?: any;
}

export interface EventDocument extends Event, Document {}

export const EventSchema = new Schema({
	guild_id: Types.Long,
	user_id: Types.Long,
	channel_id: Types.Long,
	created_at: { type: Number, required: true },
	event: { type: String, required: true },
	data: Object,
});

export const EventModel = model<EventDocument>("Event", EventSchema, "events");

// ! Custom Events that shouldn't get sent to the client but processed by the server

export interface InvalidatedEvent extends Event {
	event: "INVALIDATED";
}

// ! END Custom Events that shouldn't get sent to the client but processed by the server

export interface ReadyEvent extends Event {
	event: "READY";
	data: {
		v: number;
		user: Omit<User, "guilds" | "user_settings" | "valid_tokens_since" | "connected_accounts" | "relationships">;
		private_channels: DMChannel[]; // this will be empty for bots
		session_id: string; // resuming
		guilds: Guild[];
		analytics_token?: string;
		connected_accounts?: ConnectedAccount[];
		consents?: {
			personalization?: {
				consented?: boolean;
			};
		};
		country_code?: string; // e.g. DE
		friend_suggestion_count?: number;
		geo_ordered_rtc_regions?: string[]; // ["europe","russie","india","us-east","us-central"]
		experiments?: [number, number, number, number, number][];
		guild_experiments?: [
			// ? what are guild_experiments?
			// this is the structure of it:
			number,
			null,
			number,
			[[number, { e: number; s: number }[]]],
			[number, [[number, [number, number]]]],
			{ b: number; k: bigint[] }[]
		][];
		guild_join_requests?: []; // ? what is this? this is new
		shard?: [number, number];
		user_settings?: UserSettings;
		relationships?: [];
		user_guild_settings?: {
			entries: UserGuildSettings[];
			version: number;
			partial: boolean;
		};
		application?: {
			id: bigint;
			flags: bigint;
		};

		merged_members?: PublicMember[][]; // every guild member object for the current user
		// probably all users who the user is in contact with
		users?: {
			avatar?: string;
			discriminator: string;
			id: bigint;
			username: string;
			bot: boolean;
			public_flags: bigint;
		}[];
	};
}

export interface ChannelCreateEvent extends Event {
	event: "CHANNEL_CREATE";
	data: Channel;
}

export interface ChannelUpdateEvent extends Event {
	event: "CHANNEL_UPDATE";
	data: Channel;
}

export interface ChannelDeleteEvent extends Event {
	event: "CHANNEL_DELETE";
	data: Channel;
}

export interface ChannelPinsUpdateEvent extends Event {
	event: "CHANNEL_PINS_UPDATE";
	data: {
		guild_id?: bigint;
		channel_id: bigint;
		last_pin_timestamp: number;
	};
}

export interface GuildCreateEvent extends Event {
	event: "GUILD_CREATE";
	data: Guild;
}

export interface GuildUpdateEvent extends Event {
	event: "GUILD_UPDATE";
	data: Guild;
}

export interface GuildDeleteEvent extends Event {
	event: "GUILD_DELETE";
	data: {
		id: bigint;
		unavailable?: boolean;
	};
}

export interface GuildBanAddEvent extends Event {
	event: "GUILD_BAN_ADD";
	data: {
		guild_id: bigint;
		user: User;
	};
}

export interface GuildBanRemoveEvent extends Event {
	event: "GUILD_BAN_REMOVE";
	data: {
		guild_id: bigint;
		user: User;
	};
}

export interface GuildEmojiUpdateEvent extends Event {
	event: "GUILD_EMOJI_UPDATE";
	data: {
		guild_id: bigint;
		emojis: Emoji[];
	};
}

export interface GuildIntegrationUpdateEvent extends Event {
	event: "GUILD_INTEGRATIONS_UPDATE";
	data: {
		guild_id: bigint;
	};
}

export interface GuildMemberAddEvent extends Event {
	event: "GUILD_MEMBER_ADD";
	data: PublicMember & {
		guild_id: bigint;
	};
}

export interface GuildMemberRemoveEvent extends Event {
	event: "GUILD_MEMBER_REMOVE";
	data: {
		guild_id: bigint;
		user: User;
	};
}

export interface GuildMemberUpdateEvent extends Event {
	event: "GUILD_MEMBER_UPDATE";
	data: {
		guild_id: bigint;
		roles: bigint[];
		user: User;
		nick?: string;
		joined_at: number;
		premium_since?: number;
		pending?: boolean;
	};
}

export interface GuildMembersChunkEvent extends Event {
	event: "GUILD_MEMBERS_CHUNK";
	data: {
		guild_id: bigint;
		members: PublicMember[];
		chunk_index: number;
		chunk_count: number;
		not_found: bigint[];
		presences: Presence[];
		nonce?: string;
	};
}

export interface GuildRoleCreateEvent extends Event {
	event: "GUILD_ROLE_CREATE";
	data: {
		guild_id: bigint;
		role: Role;
	};
}

export interface GuildRoleUpdateEvent extends Event {
	event: "GUILD_ROLE_UPDATE";
	data: {
		guild_id: bigint;
		role: Role;
	};
}

export interface GuildRoleDeleteEvent extends Event {
	event: "GUILD_ROLE_DELETE";
	data: {
		guild_id: bigint;
		role_id: bigint;
	};
}

export interface InviteCreateEvent extends Event {
	event: "INVITE_CREATE";
	data: Omit<Invite, "guild" | "channel"> & {
		channel_id: bigint;
		guild_id?: bigint;
	};
}

export interface InviteDeleteEvent extends Event {
	event: "INVITE_DELETE";
	data: {
		channel_id: bigint;
		guild_id?: bigint;
		code: string;
	};
}

export type MessagePayload = Omit<Message, "author_id"> & {
	channel_id: bigint;
	guild_id?: bigint;
	author: User;
	member: PublicMember;
	mentions: (User & { member: PublicMember })[];
};

export interface MessageCreateEvent extends Event {
	event: "MESSAGE_CREATE";
	data: MessagePayload;
}

export interface MessageUpdateEvent extends Event {
	event: "MESSAGE_UPDATE";
	data: MessagePayload;
}

export interface MessageDeleteEvent extends Event {
	event: "MESSAGE_DELETE";
	data: {
		id: bigint;
		channel_id: bigint;
		guild_id?: bigint;
	};
}

export interface MessageDeleteBulkEvent extends Event {
	event: "MESSAGE_DELETE_BULK";
	data: {
		ids: bigint[];
		channel_id: bigint;
		guild_id?: bigint;
	};
}

export interface MessageReactionAddEvent extends Event {
	event: "MESSAGE_REACTION_ADD";
	data: {
		user_id: bigint;
		channel_id: bigint;
		message_id: bigint;
		guild_id?: bigint;
		member?: PublicMember;
		emoji: PartialEmoji;
	};
}

export interface MessageReactionRemoveEvent extends Event {
	event: "MESSAGE_REACTION_REMOVE";
	data: {
		user_id: bigint;
		channel_id: bigint;
		message_id: bigint;
		guild_id?: bigint;
		emoji: PartialEmoji;
	};
}

export interface MessageReactionRemoveAllEvent extends Event {
	event: "MESSAGE_REACTION_REMOVE_ALL";
	data: {
		channel_id: bigint;
		message_id: bigint;
		guild_id?: bigint;
	};
}

export interface MessageReactionRemoveEmojiEvent extends Event {
	event: "MESSAGE_REACTION_REMOVE_EMOJI";
	data: {
		channel_id: bigint;
		message_id: bigint;
		guild_id?: bigint;
		emoji: PartialEmoji;
	};
}

export interface PresenceUpdateEvent extends Event {
	event: "PRESENCE_UPDATE";
	data: Presence;
}

export interface TypingStartEvent extends Event {
	event: "TYPING_START";
	data: {
		channel_id: bigint;
		user_id: bigint;
		timestamp: number;
		guild_id?: bigint;
		member?: PublicMember;
	};
}

export interface UserUpdateEvent extends Event {
	event: "USER_UPDATE";
	data: User;
}

export interface VoiceStateUpdateEvent extends Event {
	event: "VOICE_STATE_UPDATE";
	data: VoiceState & {
		member: PublicMember;
	};
}

export interface VoiceServerUpdateEvent extends Event {
	event: "VOICE_SERVER_UPDATE";
	data: {
		token: string;
		guild_id: bigint;
		endpoint: string;
	};
}

export interface WebhooksUpdateEvent extends Event {
	event: "WEBHOOKS_UPDATE";
	data: {
		guild_id: bigint;
		channel_id: bigint;
	};
}

export type ApplicationCommandPayload = ApplicationCommand & {
	guild_id: bigint;
};

export interface ApplicationCommandCreateEvent extends Event {
	event: "APPLICATION_COMMAND_CREATE";
	data: ApplicationCommandPayload;
}

export interface ApplicationCommandUpdateEvent extends Event {
	event: "APPLICATION_COMMAND_UPDATE";
	data: ApplicationCommandPayload;
}

export interface ApplicationCommandDeleteEvent extends Event {
	event: "APPLICATION_COMMAND_DELETE";
	data: ApplicationCommandPayload;
}

export interface InteractionCreateEvent extends Event {
	event: "INTERACTION_CREATE";
	data: Interaction;
}

// located in collection events

export type EVENT =
	| "READY"
	| "CHANNEL_CREATE"
	| "CHANNEL_UPDATE"
	| "CHANNEL_DELETE"
	| "CHANNEL_PINS_UPDATE"
	| "GUILD_CREATE"
	| "GUILD_UPDATE"
	| "GUILD_DELETE"
	| "GUILD_BAN_ADD"
	| "GUILD_BAN_REMOVE"
	| "GUILD_EMOJI_UPDATE"
	| "GUILD_INTEGRATIONS_UPDATE"
	| "GUILD_MEMBER_ADD"
	| "GUILD_MEMBER_REMOVE"
	| "GUILD_MEMBER_UPDATE"
	| "GUILD_MEMBER_SPEAKING"
	| "GUILD_MEMBERS_CHUNK"
	| "GUILD_ROLE_CREATE"
	| "GUILD_ROLE_DELETE"
	| "GUILD_ROLE_UPDATE"
	| "INVITE_CREATE"
	| "INVITE_DELETE"
	| "MESSAGE_CREATE"
	| "MESSAGE_UPDATE"
	| "MESSAGE_DELETE"
	| "MESSAGE_DELETE_BULK"
	| "MESSAGE_REACTION_ADD"
	// TODO: add a new event: bulk add reaction:
	// | "MESSAGE_REACTION_BULK_ADD"
	| "MESSAGE_REACTION_REMOVE"
	| "MESSAGE_REACTION_REMOVE_ALL"
	| "MESSAGE_REACTION_REMOVE_EMOJI"
	| "PRESENCE_UPDATE"
	| "TYPING_START"
	| "USER_UPDATE"
	| "WEBHOOKS_UPDATE"
	| "INTERACTION_CREATE"
	| "VOICE_STATE_UPDATE"
	| "VOICE_SERVER_UPDATE"
	| "APPLICATION_COMMAND_CREATE"
	| "APPLICATION_COMMAND_UPDATE"
	| "APPLICATION_COMMAND_DELETE"
	| CUSTOMEVENTS;

export type CUSTOMEVENTS = "INVALIDATED";
