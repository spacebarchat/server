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

import { Payload } from "@spacebar/gateway";

export enum VoiceOPCodes {
    IDENTIFY = 0,
    SELECT_PROTOCOL = 1,
    READY = 2,
    HEARTBEAT = 3,
    SESSION_DESCRIPTION = 4,
    SPEAKING = 5,
    HEARTBEAT_ACK = 6,
    RESUME = 7,
    HELLO = 8,
    RESUMED = 9,
    // 10 is unknown
    CLIENTS_CONNECT = 11,
    VIDEO = 12,
    CLIENT_DISCONNECT = 13,
    SESSION_UPDATE = 14,
    MEDIA_SINK_WANTS = 15,
    VOICE_BACKEND_VERSION = 16,
    CHANNEL_OPTIONS_UPDATE = 17,
    CLIENT_FLAGS = 18,
    CLIENT_PLATFORM = 20,
    // crypto crap...
    DAVE_PROTOCOL_PREPARE_TRANSITION = 21,
    DAVE_PROTOCOL_EXECUTE_TRANSITION = 22,
    DAVE_PROTOCOL_TRANSITION_READY = 23,
    DAVE_PROTOCOL_PREPARE_EPOCH = 24,
    MLS_EXTERNAL_SENDER_PACKAGE = 25,
    MLS_KEY_PACKAGE = 26,
    MLS_PROPOSALS = 27,
    MLS_COMMIT_WELCOME = 28,
    MLS_ANNOUNCE_COMMIT_TRANSITION = 29,
    MLS_WELCOME = 30,
    MLS_INVALID_COMMIT_WELCOME = 31,
    // no more cypto crap?
    NO_ROUTE = 32,
}

export type VoicePayload = Omit<Payload, "op"> & { op: VoiceOPCodes };
