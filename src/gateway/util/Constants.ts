import { VoiceOPCodes } from "@fosscord/webrtc";

export enum GatewayOPCodes {
	Dispatch = 0,
	Heartbeat = 1,
	Identify = 2,
	Presence_Update = 3,
	Voice_State_Update = 4,
	Voice_Server_Ping = 5, // ? What is opcode 5?
	Resume = 6,
	Reconnect = 7,
	Request_Guild_Members = 8,
	Invalid_Session = 9,
	Hello = 10,
	Heartbeat_ACK = 11,
	Guild_Sync = 12,
	DM_Update = 13,
	Lazy_Request = 14,
	Lobby_Connect = 15,
	Lobby_Disconnect = 16,
	Lobby_Voice_States_Update = 17,
	Stream_Create = 18,
	Stream_Delete = 19,
	Stream_Watch = 20,
	Stream_Ping = 21,
	Stream_Set_Paused = 22,
	Request_Application_Commands = 24,
	Embedded_Activity_Launch = 25,
	Embedded_Activity_Close = 26,
	Embedded_Activity_Update = 27,
	Request_Forum_Unreads = 28,
	Remote_Command = 29
}

export enum GatewayOPCodes {
	DISPATCH = 0,
	HEARTBEAT = 1,
	IDENTIFY = 2,
	PRESENCE_UPDATE = 3,
	VOICE_STATE_UPDATE = 4,
	VOICE_SERVER_PING = 5,
	RESUME = 6,
	RECONNECT = 7,
	REQUEST_GUILD_MEMBERS = 8,
	INVALID_SESSION = 9,
	HELLO = 10,
	HEARTBEAT_ACK = 11,
	CALL_CONNECT = 13,
	GUILD_SUBSCRIPTIONS = 14,
	LOBBY_CONNECT = 15,
	LOBBY_DISCONNECT = 16,
	LOBBY_VOICE_STATES_UPDATE = 17,
	STREAM_CREATE = 18,
	STREAM_DELETE = 19,
	STREAM_WATCH = 20,
	STREAM_PING = 21,
	STREAM_SET_PAUSED = 22
}

export enum CloseCodes {
	Unknown_error = 4000,
	Unknown_opcode = 4001,
	Decode_error = 4002,
	Not_authenticated = 4003,
	Authentication_failed = 4004,
	Already_authenticated = 4005,
	Invalid_session = 4006,
	Invalid_seq = 4007,
	Rate_limited = 4008,
	Session_timed_out = 4009,
	Invalid_shard = 4010,
	Sharding_required = 4011,
	Invalid_API_version = 4012,
	Invalid_intent = 4013,
	Disallowed_intent = 4014
}

export interface Payload {
	op: GatewayOPCodes | VoiceOPCodes;
	d?: any;
	s?: number;
	t?: string;
}
