import { PublicUser, User, UserSettings } from "../entities/User";
import { Channel } from "../entities/Channel";
import { Guild } from "../entities/Guild";
import { Member, PublicMember, UserGuildSettings } from "../entities/Member";
import { Emoji } from "../entities/Emoji";
import { Role } from "../entities/Role";
import { Invite } from "../entities/Invite";
import { Message, PartialEmoji } from "../entities/Message";
import { VoiceState } from "../entities/VoiceState";
import { ApplicationCommand } from "../entities/Application";
import { Interaction } from "./Interaction";
import { ConnectedAccount } from "../entities/ConnectedAccount";
import { Relationship, RelationshipType } from "../entities/Relationship";
import { Presence } from "./Presence";
import { Sticker } from "..";
import { Activity, Status } from ".";

export interface Event {
	guild_id?: string;
	user_id?: string;
	channel_id?: string;
	created_at?: Date;
	event: EVENT;
	data?: any;
}

// ! Custom Events that shouldn't get sent to the client but processed by the server

export interface InvalidatedEvent extends Event {
	event: "INVALIDATED";
}

export interface PublicRelationship {
	id: string;
	user: PublicUser;
	type: RelationshipType;
}

// ! END Custom Events that shouldn't get sent to the client but processed by the server

export interface ReadyEventData {
	v: number;
	user: PublicUser & {
		mobile: boolean;
		desktop: boolean;
		email: string | undefined;
		flags: string;
		mfa_enabled: boolean;
		nsfw_allowed: boolean;
		phone: string | undefined;
		premium: boolean;
		premium_type: number;
		verified: boolean;
		bot: boolean;
	};
	private_channels: Channel[]; // this will be empty for bots
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
	guild_join_requests?: any[]; // ? what is this? this is new
	shard?: [number, number];
	user_settings?: UserSettings;
	relationships?: PublicRelationship[]; // TODO
	read_state: {
		entries: any[]; // TODO
		partial: boolean;
		version: number;
	};
	user_guild_settings?: {
		entries: UserGuildSettings[];
		version: number;
		partial: boolean;
	};
	application?: {
		id: string;
		flags: string;
	};
	merged_members?: PublicMember[][];
	// probably all users who the user is in contact with
	users?: PublicUser[];
}

export interface ReadyEvent extends Event {
	event: "READY";
	data: ReadyEventData;
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
		guild_id?: string;
		channel_id: string;
		last_pin_timestamp?: number;
	};
}

export interface ChannelRecipientAddEvent extends Event {
	event: "CHANNEL_RECIPIENT_ADD";
	data: {
		channel_id: string;
		user: User;
	};
}

export interface ChannelRecipientRemoveEvent extends Event {
	event: "CHANNEL_RECIPIENT_REMOVE";
	data: {
		channel_id: string;
		user: User;
	};
}

export interface GuildCreateEvent extends Event {
	event: "GUILD_CREATE";
	data: Guild & {
		joined_at: Date;
		// TODO: add them to guild
		guild_scheduled_events: never[];
		guild_hashes: {};
		presences: never[];
		stage_instances: never[];
		threads: never[];
	};
}

export interface GuildUpdateEvent extends Event {
	event: "GUILD_UPDATE";
	data: Guild;
}

export interface GuildDeleteEvent extends Event {
	event: "GUILD_DELETE";
	data: {
		id: string;
		unavailable?: boolean;
	};
}

export interface GuildBanAddEvent extends Event {
	event: "GUILD_BAN_ADD";
	data: {
		guild_id: string;
		user: User;
	};
}

export interface GuildBanRemoveEvent extends Event {
	event: "GUILD_BAN_REMOVE";
	data: {
		guild_id: string;
		user: User;
	};
}

export interface GuildEmojisUpdateEvent extends Event {
	event: "GUILD_EMOJIS_UPDATE";
	data: {
		guild_id: string;
		emojis: Emoji[];
	};
}

export interface GuildStickersUpdateEvent extends Event {
	event: "GUILD_STICKERS_UPDATE";
	data: {
		guild_id: string;
		stickers: Sticker[];
	};
}

export interface GuildIntegrationUpdateEvent extends Event {
	event: "GUILD_INTEGRATIONS_UPDATE";
	data: {
		guild_id: string;
	};
}

export interface GuildMemberAddEvent extends Event {
	event: "GUILD_MEMBER_ADD";
	data: PublicMember & {
		guild_id: string;
	};
}

export interface GuildMemberRemoveEvent extends Event {
	event: "GUILD_MEMBER_REMOVE";
	data: {
		guild_id: string;
		user: User;
	};
}

export interface GuildMemberUpdateEvent extends Event {
	event: "GUILD_MEMBER_UPDATE";
	data: {
		guild_id: string;
		roles: string[];
		user: User;
		nick?: string;
		joined_at?: Date;
		premium_since?: number;
		pending?: boolean;
	};
}

export interface GuildMembersChunkEvent extends Event {
	event: "GUILD_MEMBERS_CHUNK";
	data: {
		guild_id: string;
		members: PublicMember[];
		chunk_index: number;
		chunk_count: number;
		not_found: string[];
		presences: Presence[];
		nonce?: string;
	};
}

export interface GuildRoleCreateEvent extends Event {
	event: "GUILD_ROLE_CREATE";
	data: {
		guild_id: string;
		role: Role;
	};
}

export interface GuildRoleUpdateEvent extends Event {
	event: "GUILD_ROLE_UPDATE";
	data: {
		guild_id: string;
		role: Role;
	};
}

export interface GuildRoleDeleteEvent extends Event {
	event: "GUILD_ROLE_DELETE";
	data: {
		guild_id: string;
		role_id: string;
	};
}

export interface InviteCreateEvent extends Event {
	event: "INVITE_CREATE";
	data: Omit<Invite, "guild" | "channel"> & {
		channel_id: string;
		guild_id?: string;
	};
}

export interface InviteDeleteEvent extends Event {
	event: "INVITE_DELETE";
	data: {
		channel_id: string;
		guild_id?: string;
		code: string;
	};
}

export interface MessageCreateEvent extends Event {
	event: "MESSAGE_CREATE";
	data: Message;
}

export interface MessageUpdateEvent extends Event {
	event: "MESSAGE_UPDATE";
	data: Message;
}

export interface MessageDeleteEvent extends Event {
	event: "MESSAGE_DELETE";
	data: {
		id: string;
		channel_id: string;
		guild_id?: string;
	};
}

export interface MessageDeleteBulkEvent extends Event {
	event: "MESSAGE_DELETE_BULK";
	data: {
		ids: string[];
		channel_id: string;
		guild_id?: string;
	};
}

export interface MessageReactionAddEvent extends Event {
	event: "MESSAGE_REACTION_ADD";
	data: {
		user_id: string;
		channel_id: string;
		message_id: string;
		guild_id?: string;
		member?: PublicMember;
		emoji: PartialEmoji;
	};
}

export interface MessageReactionRemoveEvent extends Event {
	event: "MESSAGE_REACTION_REMOVE";
	data: {
		user_id: string;
		channel_id: string;
		message_id: string;
		guild_id?: string;
		emoji: PartialEmoji;
	};
}

export interface MessageReactionRemoveAllEvent extends Event {
	event: "MESSAGE_REACTION_REMOVE_ALL";
	data: {
		channel_id: string;
		message_id: string;
		guild_id?: string;
	};
}

export interface MessageReactionRemoveEmojiEvent extends Event {
	event: "MESSAGE_REACTION_REMOVE_EMOJI";
	data: {
		channel_id: string;
		message_id: string;
		guild_id?: string;
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
		channel_id: string;
		user_id: string;
		timestamp: number;
		guild_id?: string;
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
		guild_id: string;
		endpoint: string;
	};
}

export interface WebhooksUpdateEvent extends Event {
	event: "WEBHOOKS_UPDATE";
	data: {
		guild_id: string;
		channel_id: string;
	};
}

export type ApplicationCommandPayload = ApplicationCommand & {
	guild_id: string;
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

export interface MessageAckEvent extends Event {
	event: "MESSAGE_ACK";
	data: {
		channel_id: string;
		message_id: string;
		version?: number;
		manual?: boolean;
		mention_count?: number;
	};
}

export interface RelationshipAddEvent extends Event {
	event: "RELATIONSHIP_ADD";
	data: PublicRelationship & {
		should_notify?: boolean;
		user: PublicUser;
	};
}

export interface RelationshipRemoveEvent extends Event {
	event: "RELATIONSHIP_REMOVE";
	data: Omit<PublicRelationship, "nickname">;
}

export interface SessionsReplace extends Event {
	event: "SESSIONS_REPLACE";
	data: {
		activities: Activity[];
		client_info: {
			version: number;
			os: string;
			client: string;
		};
		status: Status;
	}[];
}

export interface GuildMemberListUpdate extends Event {
	event: "GUILD_MEMBER_LIST_UPDATE";
	data: {
		groups: { id: string; count: number }[];
		guild_id: string;
		id: string;
		member_count: number;
		online_count: number;
		ops: {
			index: number;
			item: {
				member?: PublicMember & { presence: Presence };
				group?: { id: string; count: number }[];
			};
		}[];
	};
}

export type EventData =
	| InvalidatedEvent
	| ReadyEvent
	| ChannelCreateEvent
	| ChannelUpdateEvent
	| ChannelDeleteEvent
	| ChannelPinsUpdateEvent
	| ChannelRecipientAddEvent
	| ChannelRecipientRemoveEvent
	| GuildCreateEvent
	| GuildUpdateEvent
	| GuildDeleteEvent
	| GuildBanAddEvent
	| GuildBanRemoveEvent
	| GuildEmojisUpdateEvent
	| GuildIntegrationUpdateEvent
	| GuildMemberAddEvent
	| GuildMemberRemoveEvent
	| GuildMemberUpdateEvent
	| GuildMembersChunkEvent
	| GuildMemberListUpdate
	| GuildRoleCreateEvent
	| GuildRoleUpdateEvent
	| GuildRoleDeleteEvent
	| InviteCreateEvent
	| InviteDeleteEvent
	| MessageCreateEvent
	| MessageUpdateEvent
	| MessageDeleteEvent
	| MessageDeleteBulkEvent
	| MessageReactionAddEvent
	| MessageReactionRemoveEvent
	| MessageReactionRemoveAllEvent
	| MessageReactionRemoveEmojiEvent
	| PresenceUpdateEvent
	| TypingStartEvent
	| UserUpdateEvent
	| VoiceStateUpdateEvent
	| VoiceServerUpdateEvent
	| WebhooksUpdateEvent
	| ApplicationCommandCreateEvent
	| ApplicationCommandUpdateEvent
	| ApplicationCommandDeleteEvent
	| InteractionCreateEvent
	| MessageAckEvent
	| RelationshipAddEvent
	| RelationshipRemoveEvent;

// located in collection events

export enum EVENTEnum {
	Ready = "READY",
	ChannelCreate = "CHANNEL_CREATE",
	ChannelUpdate = "CHANNEL_UPDATE",
	ChannelDelete = "CHANNEL_DELETE",
	ChannelPinsUpdate = "CHANNEL_PINS_UPDATE",
	ChannelRecipientAdd = "CHANNEL_RECIPIENT_ADD",
	ChannelRecipientRemove = "CHANNEL_RECIPIENT_REMOVE",
	GuildCreate = "GUILD_CREATE",
	GuildUpdate = "GUILD_UPDATE",
	GuildDelete = "GUILD_DELETE",
	GuildBanAdd = "GUILD_BAN_ADD",
	GuildBanRemove = "GUILD_BAN_REMOVE",
	GuildEmojUpdate = "GUILD_EMOJI_UPDATE",
	GuildIntegrationsUpdate = "GUILD_INTEGRATIONS_UPDATE",
	GuildMemberAdd = "GUILD_MEMBER_ADD",
	GuildMemberRempve = "GUILD_MEMBER_REMOVE",
	GuildMemberUpdate = "GUILD_MEMBER_UPDATE",
	GuildMemberSpeaking = "GUILD_MEMBER_SPEAKING",
	GuildMembersChunk = "GUILD_MEMBERS_CHUNK",
	GuildMemberListUpdate = "GUILD_MEMBER_LIST_UPDATE",
	GuildRoleCreate = "GUILD_ROLE_CREATE",
	GuildRoleDelete = "GUILD_ROLE_DELETE",
	GuildRoleUpdate = "GUILD_ROLE_UPDATE",
	InviteCreate = "INVITE_CREATE",
	InviteDelete = "INVITE_DELETE",
	MessageCreate = "MESSAGE_CREATE",
	MessageUpdate = "MESSAGE_UPDATE",
	MessageDelete = "MESSAGE_DELETE",
	MessageDeleteBulk = "MESSAGE_DELETE_BULK",
	MessageReactionAdd = "MESSAGE_REACTION_ADD",
	MessageReactionRemove = "MESSAGE_REACTION_REMOVE",
	MessageReactionRemoveAll = "MESSAGE_REACTION_REMOVE_ALL",
	MessageReactionRemoveEmoji = "MESSAGE_REACTION_REMOVE_EMOJI",
	PresenceUpdate = "PRESENCE_UPDATE",
	TypingStart = "TYPING_START",
	UserUpdate = "USER_UPDATE",
	WebhooksUpdate = "WEBHOOKS_UPDATE",
	InteractionCreate = "INTERACTION_CREATE",
	VoiceStateUpdate = "VOICE_STATE_UPDATE",
	VoiceServerUpdate = "VOICE_SERVER_UPDATE",
	ApplicationCommandCreate = "APPLICATION_COMMAND_CREATE",
	ApplicationCommandUpdate = "APPLICATION_COMMAND_UPDATE",
	ApplicationCommandDelete = "APPLICATION_COMMAND_DELETE",
	SessionsReplace = "SESSIONS_REPLACE",
}

export type EVENT =
	| "READY"
	| "CHANNEL_CREATE"
	| "CHANNEL_UPDATE"
	| "CHANNEL_DELETE"
	| "CHANNEL_PINS_UPDATE"
	| "CHANNEL_RECIPIENT_ADD"
	| "CHANNEL_RECIPIENT_REMOVE"
	| "GUILD_CREATE"
	| "GUILD_UPDATE"
	| "GUILD_DELETE"
	| "GUILD_BAN_ADD"
	| "GUILD_BAN_REMOVE"
	| "GUILD_EMOJIS_UPDATE"
	| "GUILD_STICKERS_UPDATE"
	| "GUILD_INTEGRATIONS_UPDATE"
	| "GUILD_MEMBER_ADD"
	| "GUILD_MEMBER_REMOVE"
	| "GUILD_MEMBER_UPDATE"
	| "GUILD_MEMBER_SPEAKING"
	| "GUILD_MEMBERS_CHUNK"
	| "GUILD_MEMBER_LIST_UPDATE"
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
	| "MESSAGE_ACK"
	| "RELATIONSHIP_ADD"
	| "RELATIONSHIP_REMOVE"
	| "SESSIONS_REPLACE"
	| CUSTOMEVENTS;

export type CUSTOMEVENTS = "INVALIDATED" | "RATELIMIT";
