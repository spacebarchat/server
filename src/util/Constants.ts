import crypto from "crypto";
import { VerifyOptions } from "jsonwebtoken";
import fs from "fs";

export interface RateLimit {
	count: number;
	timespan: number;
}

export interface DefaultOptions {
	limits: {
		user: {
			maxGuilds: number;
			maxUsername: number;
			maxFriends: number;
		};
		guild: {
			maxRoles: number;
			maxMembers: number;
			maxChannels: number;
			maxChannelsInCategory: number;
			hideOfflineMember: number;
		};
		message: {
			characters: number;
			ttsCharacters: number;
			maxReactions: number;
			maxAttachmentSize: number;
		};
		channel: {
			maxPins: number;
			maxTopic: number;
		};
		rate: {
			ip: {
				enabled: boolean;
				count: number;
				timespan: number;
			};
			routes: {
				auth?: {
					login?: RateLimit;
					register?: RateLimit;
				};
				channel?: {};
				// TODO: rate limit configuration for all routes
			};
		};
	};
	security: {
		jwtSecret: string;
		forwadedFor: string | null;
		captcha: {
			enabled: boolean;
			service: "recaptcha" | null; // TODO: hcaptcha, custom
			sitekey: string | null;
		};
	};
	register: {
		email: {
			required: boolean;
			allowlist: boolean;
			blocklist: boolean;
			domains: string[];
		};
		dateOfBirth: {
			required: boolean;
			minimum: number; // in years
		};
		requireCaptcha: boolean;
		requireInvite: boolean;
		allowNewRegistration: boolean;
		allowMultipleAccounts: boolean;
		password: {
			pwMinLength: number;
			pwMinNumbers: number;
			pwMinUpperCase: number;
			pwMinSymbols: number;
		};
	};
}

export const DefaultOptions: DefaultOptions = {
	limits: {
		user: {
			maxGuilds: 100,
			maxUsername: 32,
			maxFriends: 1000,
		},
		guild: {
			maxRoles: 250,
			maxMembers: 250000,
			maxChannels: 500,
			maxChannelsInCategory: 50,
			hideOfflineMember: 1000,
		},
		message: {
			characters: 2000,
			ttsCharacters: 200,
			maxReactions: 20,
			maxAttachmentSize: 8388608,
		},
		channel: {
			maxPins: 50,
			maxTopic: 1024,
		},
		rate: {
			ip: {
				enabled: true,
				count: 1000,
				timespan: 1000 * 60 * 10,
			},
			routes: {},
		},
	},
	security: {
		jwtSecret: crypto.randomBytes(256).toString("base64"),
		forwadedFor: null,
		// forwadedFor: "X-Forwarded-For" // nginx/reverse proxy
		// forwadedFor: "CF-Connecting-IP" // cloudflare:
		captcha: {
			enabled: false,
			service: null,
			sitekey: null,
		},
	},
	register: {
		email: {
			required: true,
			allowlist: false,
			blocklist: true,
			domains: [], // TODO: efficiently save domain blocklist in database
			// domains: fs.readFileSync(__dirname + "/blockedEmailDomains.txt", { encoding: "utf8" }).split("\n"),
		},
		dateOfBirth: {
			required: true,
			minimum: 13,
		},
		requireInvite: false,
		requireCaptcha: true,
		allowNewRegistration: true,
		allowMultipleAccounts: true,
		password: {
			pwMinLength: 8,
			pwMinNumbers: 2,
			pwMinUpperCase: 2,
			pwMinSymbols: 0,
		},
	},
};

export const JWTOptions: VerifyOptions = { algorithms: ["HS256"] };

export const WSCodes = {
	1000: "WS_CLOSE_REQUESTED",
	4004: "TOKEN_INVALID",
	4010: "SHARDING_INVALID",
	4011: "SHARDING_REQUIRED",
	4013: "INVALID_INTENTS",
	4014: "DISALLOWED_INTENTS",
};

const AllowedImageFormats = ["webp", "png", "jpg", "jpeg", "gif"];

const AllowedImageSizes = Array.from({ length: 9 }, (e, i) => 2 ** (i + 4));

function makeImageUrl(root: string, { format = "webp", size = 512 } = {}) {
	if (format && !AllowedImageFormats.includes(format)) throw new Error("IMAGE_FORMAT: " + format);
	if (size && !AllowedImageSizes.includes(size)) throw new RangeError("IMAGE_SIZE: " + size);
	return `${root}.${format}${size ? `?size=${size}` : ""}`;
}
/**
 * Options for Image URLs.
 * @typedef {Object} ImageURLOptions
 * @property {string} [format] One of `webp`, `png`, `jpg`, `jpeg`, `gif`. If no format is provided,
 * defaults to `webp`.
 * @property {boolean} [dynamic] If true, the format will dynamically change to `gif` for
 * animated avatars; the default is false.
 * @property {number} [size] One of `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`, `4096`
 */

export const Endpoints = {
	CDN(root: string) {
		return {
			Emoji: (emojiID: string, format = "png") => `${root}/emojis/${emojiID}.${format}`,
			Asset: (name: string) => `${root}/assets/${name}`,
			DefaultAvatar: (discriminator: string) => `${root}/embed/avatars/${discriminator}.png`,
			Avatar: (userID: string, hash: string, format = "webp", size: number, dynamic = false) => {
				if (dynamic) format = hash.startsWith("a_") ? "gif" : format;
				return makeImageUrl(`${root}/avatars/${userID}/${hash}`, { format, size });
			},
			Banner: (guildID: string, hash: string, format = "webp", size: number) =>
				makeImageUrl(`${root}/banners/${guildID}/${hash}`, { format, size }),
			Icon: (guildID: string, hash: string, format = "webp", size: number, dynamic = false) => {
				if (dynamic) format = hash.startsWith("a_") ? "gif" : format;
				return makeImageUrl(`${root}/icons/${guildID}/${hash}`, { format, size });
			},
			AppIcon: (
				clientID: string,
				hash: string,
				{ format = "webp", size }: { format?: string; size?: number } = {}
			) => makeImageUrl(`${root}/app-icons/${clientID}/${hash}`, { size, format }),
			AppAsset: (
				clientID: string,
				hash: string,
				{ format = "webp", size }: { format?: string; size?: number } = {}
			) => makeImageUrl(`${root}/app-assets/${clientID}/${hash}`, { size, format }),
			GDMIcon: (channelID: string, hash: string, format = "webp", size: number) =>
				makeImageUrl(`${root}/channel-icons/${channelID}/${hash}`, { size, format }),
			Splash: (guildID: string, hash: string, format = "webp", size: number) =>
				makeImageUrl(`${root}/splashes/${guildID}/${hash}`, { size, format }),
			DiscoverySplash: (guildID: string, hash: string, format = "webp", size: number) =>
				makeImageUrl(`${root}/discovery-splashes/${guildID}/${hash}`, { size, format }),
			TeamIcon: (
				teamID: string,
				hash: string,
				{ format = "webp", size }: { format?: string; size?: number } = {}
			) => makeImageUrl(`${root}/team-icons/${teamID}/${hash}`, { size, format }),
		};
	},
	invite: (root: string, code: string) => `${root}/${code}`,
	botGateway: "/gateway/bot",
};

/**
 * The current status of the client. Here are the available statuses:
 * * READY: 0
 * * CONNECTING: 1
 * * RECONNECTING: 2
 * * IDLE: 3
 * * NEARLY: 4
 * * DISCONNECTED: 5
 * * WAITING_FOR_GUILDS: 6
 * * IDENTIFYING: 7
 * * RESUMING: 8
 * @typedef {number} Status
 */
export const Status = {
	READY: 0,
	CONNECTING: 1,
	RECONNECTING: 2,
	IDLE: 3,
	NEARLY: 4,
	DISCONNECTED: 5,
	WAITING_FOR_GUILDS: 6,
	IDENTIFYING: 7,
	RESUMING: 8,
};

/**
 * The current status of a voice connection. Here are the available statuses:
 * * CONNECTED: 0
 * * CONNECTING: 1
 * * AUTHENTICATING: 2
 * * RECONNECTING: 3
 * * DISCONNECTED: 4
 * @typedef {number} VoiceStatus
 */
export const VoiceStatus = {
	CONNECTED: 0,
	CONNECTING: 1,
	AUTHENTICATING: 2,
	RECONNECTING: 3,
	DISCONNECTED: 4,
};

export const OPCodes = {
	DISPATCH: 0,
	HEARTBEAT: 1,
	IDENTIFY: 2,
	STATUS_UPDATE: 3,
	VOICE_STATE_UPDATE: 4,
	VOICE_GUILD_PING: 5,
	RESUME: 6,
	RECONNECT: 7,
	REQUEST_GUILD_MEMBERS: 8,
	INVALID_SESSION: 9,
	HELLO: 10,
	HEARTBEAT_ACK: 11,
};

export const VoiceOPCodes = {
	IDENTIFY: 0,
	SELECT_PROTOCOL: 1,
	READY: 2,
	HEARTBEAT: 3,
	SESSION_DESCRIPTION: 4,
	SPEAKING: 5,
	HELLO: 8,
	CLIENT_CONNECT: 12,
	CLIENT_DISCONNECT: 13,
};

export const Events = {
	RATE_LIMIT: "rateLimit",
	CLIENT_READY: "ready",
	GUILD_CREATE: "guildCreate",
	GUILD_DELETE: "guildDelete",
	GUILD_UPDATE: "guildUpdate",
	GUILD_UNAVAILABLE: "guildUnavailable",
	GUILD_AVAILABLE: "guildAvailable",
	GUILD_MEMBER_ADD: "guildMemberAdd",
	GUILD_MEMBER_REMOVE: "guildMemberRemove",
	GUILD_MEMBER_UPDATE: "guildMemberUpdate",
	GUILD_MEMBER_AVAILABLE: "guildMemberAvailable",
	GUILD_MEMBER_SPEAKING: "guildMemberSpeaking",
	GUILD_MEMBERS_CHUNK: "guildMembersChunk",
	GUILD_INTEGRATIONS_UPDATE: "guildIntegrationsUpdate",
	GUILD_ROLE_CREATE: "roleCreate",
	GUILD_ROLE_DELETE: "roleDelete",
	INVITE_CREATE: "inviteCreate",
	INVITE_DELETE: "inviteDelete",
	GUILD_ROLE_UPDATE: "roleUpdate",
	GUILD_EMOJI_CREATE: "emojiCreate",
	GUILD_EMOJI_DELETE: "emojiDelete",
	GUILD_EMOJI_UPDATE: "emojiUpdate",
	GUILD_BAN_ADD: "guildBanAdd",
	GUILD_BAN_REMOVE: "guildBanRemove",
	CHANNEL_CREATE: "channelCreate",
	CHANNEL_DELETE: "channelDelete",
	CHANNEL_UPDATE: "channelUpdate",
	CHANNEL_PINS_UPDATE: "channelPinsUpdate",
	MESSAGE_CREATE: "message",
	MESSAGE_DELETE: "messageDelete",
	MESSAGE_UPDATE: "messageUpdate",
	MESSAGE_BULK_DELETE: "messageDeleteBulk",
	MESSAGE_REACTION_ADD: "messageReactionAdd",
	MESSAGE_REACTION_REMOVE: "messageReactionRemove",
	MESSAGE_REACTION_REMOVE_ALL: "messageReactionRemoveAll",
	MESSAGE_REACTION_REMOVE_EMOJI: "messageReactionRemoveEmoji",
	USER_UPDATE: "userUpdate",
	PRESENCE_UPDATE: "presenceUpdate",
	VOICE_SERVER_UPDATE: "voiceServerUpdate",
	VOICE_STATE_UPDATE: "voiceStateUpdate",
	VOICE_BROADCAST_SUBSCRIBE: "subscribe",
	VOICE_BROADCAST_UNSUBSCRIBE: "unsubscribe",
	TYPING_START: "typingStart",
	TYPING_STOP: "typingStop",
	WEBHOOKS_UPDATE: "webhookUpdate",
	ERROR: "error",
	WARN: "warn",
	DEBUG: "debug",
	SHARD_DISCONNECT: "shardDisconnect",
	SHARD_ERROR: "shardError",
	SHARD_RECONNECTING: "shardReconnecting",
	SHARD_READY: "shardReady",
	SHARD_RESUME: "shardResume",
	INVALIDATED: "invalidated",
	RAW: "raw",
};

export const ShardEvents = {
	CLOSE: "close",
	DESTROYED: "destroyed",
	INVALID_SESSION: "invalidSession",
	READY: "ready",
	RESUMED: "resumed",
	ALL_READY: "allReady",
};

/**
 * The type of Structure allowed to be a partial:
 * * USER
 * * CHANNEL (only affects DMChannels)
 * * GUILD_MEMBER
 * * MESSAGE
 * * REACTION
 * <warn>Partials require you to put checks in place when handling data, read the Partials topic listed in the
 * sidebar for more information.</warn>
 * @typedef {string} PartialType
 */
export const PartialTypes = keyMirror(["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]);

/**
 * The type of a websocket message event, e.g. `MESSAGE_CREATE`. Here are the available events:
 * * READY
 * * RESUMED
 * * GUILD_CREATE
 * * GUILD_DELETE
 * * GUILD_UPDATE
 * * INVITE_CREATE
 * * INVITE_DELETE
 * * GUILD_MEMBER_ADD
 * * GUILD_MEMBER_REMOVE
 * * GUILD_MEMBER_UPDATE
 * * GUILD_MEMBERS_CHUNK
 * * GUILD_INTEGRATIONS_UPDATE
 * * GUILD_ROLE_CREATE
 * * GUILD_ROLE_DELETE
 * * GUILD_ROLE_UPDATE
 * * GUILD_BAN_ADD
 * * GUILD_BAN_REMOVE
 * * GUILD_EMOJIS_UPDATE
 * * CHANNEL_CREATE
 * * CHANNEL_DELETE
 * * CHANNEL_UPDATE
 * * CHANNEL_PINS_UPDATE
 * * MESSAGE_CREATE
 * * MESSAGE_DELETE
 * * MESSAGE_UPDATE
 * * MESSAGE_DELETE_BULK
 * * MESSAGE_REACTION_ADD
 * * MESSAGE_REACTION_REMOVE
 * * MESSAGE_REACTION_REMOVE_ALL
 * * MESSAGE_REACTION_REMOVE_EMOJI
 * * USER_UPDATE
 * * PRESENCE_UPDATE
 * * TYPING_START
 * * VOICE_STATE_UPDATE
 * * VOICE_SERVER_UPDATE
 * * WEBHOOKS_UPDATE
 * @typedef {string} WSEventType
 */
export const WSEvents = keyMirror([
	"READY",
	"RESUMED",
	"GUILD_CREATE",
	"GUILD_DELETE",
	"GUILD_UPDATE",
	"INVITE_CREATE",
	"INVITE_DELETE",
	"GUILD_MEMBER_ADD",
	"GUILD_MEMBER_REMOVE",
	"GUILD_MEMBER_UPDATE",
	"GUILD_MEMBERS_CHUNK",
	"GUILD_INTEGRATIONS_UPDATE",
	"GUILD_ROLE_CREATE",
	"GUILD_ROLE_DELETE",
	"GUILD_ROLE_UPDATE",
	"GUILD_BAN_ADD",
	"GUILD_BAN_REMOVE",
	"GUILD_EMOJIS_UPDATE",
	"CHANNEL_CREATE",
	"CHANNEL_DELETE",
	"CHANNEL_UPDATE",
	"CHANNEL_PINS_UPDATE",
	"MESSAGE_CREATE",
	"MESSAGE_DELETE",
	"MESSAGE_UPDATE",
	"MESSAGE_DELETE_BULK",
	"MESSAGE_REACTION_ADD",
	"MESSAGE_REACTION_REMOVE",
	"MESSAGE_REACTION_REMOVE_ALL",
	"MESSAGE_REACTION_REMOVE_EMOJI",
	"USER_UPDATE",
	"PRESENCE_UPDATE",
	"TYPING_START",
	"VOICE_STATE_UPDATE",
	"VOICE_SERVER_UPDATE",
	"WEBHOOKS_UPDATE",
]);

/**
 * The type of a message, e.g. `DEFAULT`. Here are the available types:
 * * DEFAULT
 * * RECIPIENT_ADD
 * * RECIPIENT_REMOVE
 * * CALL
 * * CHANNEL_NAME_CHANGE
 * * CHANNEL_ICON_CHANGE
 * * PINS_ADD
 * * GUILD_MEMBER_JOIN
 * * USER_PREMIUM_GUILD_SUBSCRIPTION
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3
 * * CHANNEL_FOLLOW_ADD
 * * GUILD_DISCOVERY_DISQUALIFIED
 * * GUILD_DISCOVERY_REQUALIFIED
 * * REPLY
 * @typedef {string} MessageType
 */
export const MessageTypes = [
	"DEFAULT",
	"RECIPIENT_ADD",
	"RECIPIENT_REMOVE",
	"CALL",
	"CHANNEL_NAME_CHANGE",
	"CHANNEL_ICON_CHANGE",
	"PINS_ADD",
	"GUILD_MEMBER_JOIN",
	"USER_PREMIUM_GUILD_SUBSCRIPTION",
	"USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1",
	"USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2",
	"USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3",
	"CHANNEL_FOLLOW_ADD",
	null,
	"GUILD_DISCOVERY_DISQUALIFIED",
	"GUILD_DISCOVERY_REQUALIFIED",
	null,
	null,
	null,
	"REPLY",
];

/**
 * The types of messages that are `System`. The available types are `MessageTypes` excluding:
 * * DEFAULT
 * * REPLY
 * @typedef {string} SystemMessageType
 */
export const SystemMessageTypes = MessageTypes.filter(
	(type: string | null) => type && type !== "DEFAULT" && type !== "REPLY"
);

/**
 * <info>Bots cannot set a `CUSTOM_STATUS`, it is only for custom statuses received from users</info>
 * The type of an activity of a users presence, e.g. `PLAYING`. Here are the available types:
 * * PLAYING
 * * STREAMING
 * * LISTENING
 * * WATCHING
 * * CUSTOM_STATUS
 * * COMPETING
 * @typedef {string} ActivityType
 */
export const ActivityTypes = ["PLAYING", "STREAMING", "LISTENING", "WATCHING", "CUSTOM_STATUS", "COMPETING"];

export const ChannelTypes = {
	TEXT: 0,
	DM: 1,
	VOICE: 2,
	GROUP: 3,
	CATEGORY: 4,
	NEWS: 5,
	STORE: 6,
};

export const ClientApplicationAssetTypes = {
	SMALL: 1,
	BIG: 2,
};

export const Colors = {
	DEFAULT: 0x000000,
	WHITE: 0xffffff,
	AQUA: 0x1abc9c,
	GREEN: 0x2ecc71,
	BLUE: 0x3498db,
	YELLOW: 0xffff00,
	PURPLE: 0x9b59b6,
	LUMINOUS_VIVID_PINK: 0xe91e63,
	GOLD: 0xf1c40f,
	ORANGE: 0xe67e22,
	RED: 0xe74c3c,
	GREY: 0x95a5a6,
	NAVY: 0x34495e,
	DARK_AQUA: 0x11806a,
	DARK_GREEN: 0x1f8b4c,
	DARK_BLUE: 0x206694,
	DARK_PURPLE: 0x71368a,
	DARK_VIVID_PINK: 0xad1457,
	DARK_GOLD: 0xc27c0e,
	DARK_ORANGE: 0xa84300,
	DARK_RED: 0x992d22,
	DARK_GREY: 0x979c9f,
	DARKER_GREY: 0x7f8c8d,
	LIGHT_GREY: 0xbcc0c0,
	DARK_NAVY: 0x2c3e50,
	BLURPLE: 0x7289da,
	GREYPLE: 0x99aab5,
	DARK_BUT_NOT_BLACK: 0x2c2f33,
	NOT_QUITE_BLACK: 0x23272a,
};

/**
 * The value set for the explicit content filter levels for a guild:
 * * DISABLED
 * * MEMBERS_WITHOUT_ROLES
 * * ALL_MEMBERS
 * @typedef {string} ExplicitContentFilterLevel
 */
export const ExplicitContentFilterLevels = ["DISABLED", "MEMBERS_WITHOUT_ROLES", "ALL_MEMBERS"];

/**
 * The value set for the verification levels for a guild:
 * * NONE
 * * LOW
 * * MEDIUM
 * * HIGH
 * * VERY_HIGH
 * @typedef {string} VerificationLevel
 */
export const VerificationLevels = ["NONE", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"];

/**
 * An error encountered while performing an API request. Here are the potential errors:
 * * UNKNOWN_ACCOUNT
 * * UNKNOWN_APPLICATION
 * * UNKNOWN_CHANNEL
 * * UNKNOWN_GUILD
 * * UNKNOWN_INTEGRATION
 * * UNKNOWN_INVITE
 * * UNKNOWN_MEMBER
 * * UNKNOWN_MESSAGE
 * * UNKNOWN_OVERWRITE
 * * UNKNOWN_PROVIDER
 * * UNKNOWN_ROLE
 * * UNKNOWN_TOKEN
 * * UNKNOWN_USER
 * * UNKNOWN_EMOJI
 * * UNKNOWN_WEBHOOK
 * * UNKNOWN_BAN
 * * UNKNOWN_GUILD_TEMPLATE
 * * BOT_PROHIBITED_ENDPOINT
 * * BOT_ONLY_ENDPOINT
 * * CHANNEL_HIT_WRITE_RATELIMIT
 * * MAXIMUM_GUILDS
 * * MAXIMUM_FRIENDS
 * * MAXIMUM_PINS
 * * MAXIMUM_ROLES
 * * MAXIMUM_WEBHOOKS
 * * MAXIMUM_REACTIONS
 * * MAXIMUM_CHANNELS
 * * MAXIMUM_ATTACHMENTS
 * * MAXIMUM_INVITES
 * * GUILD_ALREADY_HAS_TEMPLATE
 * * UNAUTHORIZED
 * * ACCOUNT_VERIFICATION_REQUIRED
 * * REQUEST_ENTITY_TOO_LARGE
 * * FEATURE_TEMPORARILY_DISABLED
 * * USER_BANNED
 * * ALREADY_CROSSPOSTED
 * * MISSING_ACCESS
 * * INVALID_ACCOUNT_TYPE
 * * CANNOT_EXECUTE_ON_DM
 * * EMBED_DISABLED
 * * CANNOT_EDIT_MESSAGE_BY_OTHER
 * * CANNOT_SEND_EMPTY_MESSAGE
 * * CANNOT_MESSAGE_USER
 * * CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL
 * * CHANNEL_VERIFICATION_LEVEL_TOO_HIGH
 * * OAUTH2_APPLICATION_BOT_ABSENT
 * * MAXIMUM_OAUTH2_APPLICATIONS
 * * INVALID_OAUTH_STATE
 * * MISSING_PERMISSIONS
 * * INVALID_AUTHENTICATION_TOKEN
 * * NOTE_TOO_LONG
 * * INVALID_BULK_DELETE_QUANTITY
 * * CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL
 * * INVALID_OR_TAKEN_INVITE_CODE
 * * CANNOT_EXECUTE_ON_SYSTEM_MESSAGE
 * * INVALID_OAUTH_TOKEN
 * * BULK_DELETE_MESSAGE_TOO_OLD
 * * INVALID_FORM_BODY
 * * INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT
 * * INVALID_API_VERSION
 * * CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL
 * * REACTION_BLOCKED
 * * RESOURCE_OVERLOADED
 * @typedef {string} APIError
 */
export const APIErrors = {
	UNKNOWN_ACCOUNT: 10001,
	UNKNOWN_APPLICATION: 10002,
	UNKNOWN_CHANNEL: 10003,
	UNKNOWN_GUILD: 10004,
	UNKNOWN_INTEGRATION: 10005,
	UNKNOWN_INVITE: 10006,
	UNKNOWN_MEMBER: 10007,
	UNKNOWN_MESSAGE: 10008,
	UNKNOWN_OVERWRITE: 10009,
	UNKNOWN_PROVIDER: 10010,
	UNKNOWN_ROLE: 10011,
	UNKNOWN_TOKEN: 10012,
	UNKNOWN_USER: 10013,
	UNKNOWN_EMOJI: 10014,
	UNKNOWN_WEBHOOK: 10015,
	UNKNOWN_BAN: 10026,
	UNKNOWN_GUILD_TEMPLATE: 10057,
	BOT_PROHIBITED_ENDPOINT: 20001,
	BOT_ONLY_ENDPOINT: 20002,
	CHANNEL_HIT_WRITE_RATELIMIT: 20028,
	MAXIMUM_GUILDS: 30001,
	MAXIMUM_FRIENDS: 30002,
	MAXIMUM_PINS: 30003,
	MAXIMUM_ROLES: 30005,
	MAXIMUM_WEBHOOKS: 30007,
	MAXIMUM_REACTIONS: 30010,
	MAXIMUM_CHANNELS: 30013,
	MAXIMUM_ATTACHMENTS: 30015,
	MAXIMUM_INVITES: 30016,
	GUILD_ALREADY_HAS_TEMPLATE: 30031,
	UNAUTHORIZED: 40001,
	ACCOUNT_VERIFICATION_REQUIRED: 40002,
	REQUEST_ENTITY_TOO_LARGE: 40005,
	FEATURE_TEMPORARILY_DISABLED: 40006,
	USER_BANNED: 40007,
	ALREADY_CROSSPOSTED: 40033,
	MISSING_ACCESS: 50001,
	INVALID_ACCOUNT_TYPE: 50002,
	CANNOT_EXECUTE_ON_DM: 50003,
	EMBED_DISABLED: 50004,
	CANNOT_EDIT_MESSAGE_BY_OTHER: 50005,
	CANNOT_SEND_EMPTY_MESSAGE: 50006,
	CANNOT_MESSAGE_USER: 50007,
	CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL: 50008,
	CHANNEL_VERIFICATION_LEVEL_TOO_HIGH: 50009,
	OAUTH2_APPLICATION_BOT_ABSENT: 50010,
	MAXIMUM_OAUTH2_APPLICATIONS: 50011,
	INVALID_OAUTH_STATE: 50012,
	MISSING_PERMISSIONS: 50013,
	INVALID_AUTHENTICATION_TOKEN: 50014,
	NOTE_TOO_LONG: 50015,
	INVALID_BULK_DELETE_QUANTITY: 50016,
	CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL: 50019,
	INVALID_OR_TAKEN_INVITE_CODE: 50020,
	CANNOT_EXECUTE_ON_SYSTEM_MESSAGE: 50021,
	INVALID_OAUTH_TOKEN: 50025,
	BULK_DELETE_MESSAGE_TOO_OLD: 50034,
	INVALID_FORM_BODY: 50035,
	INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT: 50036,
	INVALID_API_VERSION: 50041,
	CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL: 50074,
	REACTION_BLOCKED: 90001,
	RESOURCE_OVERLOADED: 130000,
};

/**
 * The value set for a guild's default message notifications, e.g. `ALL`. Here are the available types:
 * * ALL
 * * MENTIONS
 * @typedef {string} DefaultMessageNotifications
 */
export const DefaultMessageNotifications = ["ALL", "MENTIONS"];

/**
 * The value set for a team members's membership state:
 * * INVITED
 * * ACCEPTED
 * @typedef {string} MembershipStates
 */
export const MembershipStates = [
	// They start at 1
	null,
	"INVITED",
	"ACCEPTED",
];

/**
 * The value set for a webhook's type:
 * * Incoming
 * * Channel Follower
 * @typedef {string} WebhookTypes
 */
export const WebhookTypes = [
	// They start at 1
	null,
	"Incoming",
	"Channel Follower",
];

function keyMirror(arr: string[]) {
	let tmp = Object.create(null);
	for (const value of arr) tmp[value] = value;
	return tmp;
}
