export enum OPCODES {
	Dispatch,
	Heartbeat,
	Identify,
	Presence_Update,
	Voice_State_Update,
	Resume,
	Reconnect,
	Request_Guild_Members,
	Invalid_Session,
	Hello,
	Heartbeat_ACK,
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
