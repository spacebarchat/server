export enum OPCODES {
	Identify = 0,
	Select_Protocol = 1,
	Ready = 2,
	Heartbeat = 3,
	Session_Description = 4,
	Speaking = 5,
	Heartbeat_Acknowledge = 6,
	Resume = 7,
	Hello = 8,
	Resumed = 9,
	Client_Disconnected = 13,
}

export enum CLOSECODES {
	Unknown_error = 4000,
	Unknown_opcode = 4001,
	Decode_error = 4002,
	Not_authenticated = 4003,
	Authentication_failed = 4004,
	Already_authenticated = 4005,
	Invalid_session = 4006,
	Session_Timeout = 4009,
	Server_not_found = 4011,
	Unkown_Protocol = 4012,
	Disconnected = 4014, // Channel was deleted, you were kicked, voice server changed, or the main gateway session was dropped. Should not reconnect.
	Voice_Server_Crash = 4015, // The server crashed. Try resuming.
	Unkown_Encryption_mode = 4016,
}

export interface Payload {
	op: OPCODES;
	d?: any;
	s?: number;
	t?: string;
}
