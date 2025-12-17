/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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

import { OPCODES, Payload, WebSocket } from "@spacebar/gateway";
import { setHeartbeat } from "../util/Heartbeat";
import { Send } from "../util/Send";
import { Session } from "@spacebar/util";
import { FindOptionsWhere } from "typeorm";

interface QoSData {
	seq: number | null;
	qos: QoSPayload;
}

export interface QoSPayload {
	ver: number;
	active: boolean;
	reasons: string[];
}

export async function onHeartbeat(this: WebSocket, data: Payload) {
	// TODO: validate payload

	setHeartbeat(this);

	if (data.op === OPCODES.SetQoS) {
		this.qos = (data.d as QoSData).qos;
	}

	const newSessionData: Partial<Session> = {
		last_seen: new Date(),
	};

	await Promise.all([
		Send(this, { op: 11, d: {} }),
		Session.update(
			{
				session_id: this.session_id!,
				user_id: this.user_id
			} as FindOptionsWhere<Session>,
			newSessionData,
		),
	]);
}
