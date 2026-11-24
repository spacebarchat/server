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

export enum OPCODES {
    Dispatch = 0,
    Heartbeat = 1,
    Identify = 2,
    Presence_Update = 3,
    Voice_State_Update = 4,
    Voice_Server_Ping = 5,
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
    LFG_Subscription = 23, // how did this work
    Request_Application_Commands = 24,
    Embedded_Activity_Create = 25,
    Embedded_Activity_Delete = 26,
    Embedded_Activity_Update = 27,
    Request_Forum_Unreads = 28,
    Remote_Command = 29,
    Request_Deleted_Entity_Ids = 30,
    Request_Soundboard_Sounds = 31,
    Speed_Test_Create = 32,
    Speed_test_Delete = 33,
    Request_Last_Messages = 34,
    Search_Recent_Members = 35,
    Request_Channel_Statuses = 36,
    Guild_Subscriptions_Bulk = 37,
    Guild_Channels_Resync = 38,
    Request_Channel_Member_Count = 39,
    QoS_Heartbeat = 40,
    Update_Time_Spent_Session_Id = 41,
    Lobby_Voice_Server_Ping = 42,
    Request_Channel_Info = 43,
}
export enum CLOSECODES {
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
    Disallowed_intent = 4014,
    Too_many_sessions = 4015,
    Connection_request_cancelled = 4016,
}

export interface Payload {
    op: OPCODES;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d?: any;
    s?: number;
    t?: string;
}
