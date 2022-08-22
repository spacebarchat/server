export enum OPCODES {
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
}
export enum CLOSECODES {
	Unknown_error = 4000,
	Unknown_opcode,
	Decode_error,
	Not_authenticated,
	Authentication_failed,
	Already_authenticated,
	Invalid_session,
	Invalid_seq,
	Rate_limited,
	Session_timed_out,
	Invalid_shard,
	Sharding_required,
	Invalid_API_version,
	Invalid_intent,
	Disallowed_intent,
}

export interface Payload {
	op: OPCODES;
	d?: any;
	s?: number;
	t?: string;
}
