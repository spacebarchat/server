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

import { WebSocket, Payload } from "@spacebar/gateway";
import { onHeartbeat } from "./Heartbeat";
import { onIdentify } from "./Identify";
import { onLazyRequest } from "./LazyRequest";
import { onPresenceUpdate } from "./PresenceUpdate";
import { onRequestGuildMembers } from "./RequestGuildMembers";
import { onResume } from "./Resume";
import { onVoiceStateUpdate } from "./VoiceStateUpdate";
import { onGuildSubscriptionsBulk } from "./GuildSubscriptionsBulk";

export type OPCodeHandler = (this: WebSocket, data: Payload) => unknown;

export default {
	1: onHeartbeat,
	2: onIdentify,
	3: onPresenceUpdate,
	4: onVoiceStateUpdate,
	// 5: Voice Server Ping
	6: onResume,
	// 7: Reconnect: You should attempt to reconnect and resume immediately.
	8: onRequestGuildMembers,
	// 9: Invalid Session
	// 10: Hello
	// 13: Dm_update
	14: onLazyRequest,
	37: onGuildSubscriptionsBulk,
} as { [key: number]: OPCodeHandler };
