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

import { CLOSECODES, Payload, WebSocket } from "@spacebar/gateway";
import { Send } from "../util/Send";
import { OPCODES } from "../util/Constants";
import { getReplayEvents, getReplaySession, deleteReplaySession } from "../util/ReplayBuffer";
import { checkToken } from "@spacebar/util";
import { setHeartbeat } from "../util/Heartbeat";

export async function onResume(this: WebSocket, data: Payload) {
    const resume = data.d as { token: string; session_id: string; seq: number } | undefined;

    if (!resume || !resume.token || !resume.session_id || resume.seq === undefined) {
        console.log("[Gateway] Resume: missing fields, sending Invalid Session");
        await Send(this, { op: OPCODES.Invalid_Session, d: false });
        return;
    }

    // Validate the token
    let tokenData;
    try {
        tokenData = await checkToken(resume.token, {
            ipAddress: this.ipAddress,
            fingerprint: this.fingerprint,
        });
    } catch {
        console.log("[Gateway] Resume: invalid token");
        await Send(this, { op: OPCODES.Invalid_Session, d: false });
        return;
    }

    // Check the replay session exists and belongs to this user
    const replaySession = getReplaySession(resume.session_id);
    if (!replaySession || replaySession.userId !== tokenData.user.id) {
        console.log("[Gateway] Resume: session not found or user mismatch");
        await Send(this, { op: OPCODES.Invalid_Session, d: false });
        return;
    }

    // Get events to replay
    const events = getReplayEvents(resume.session_id, resume.seq);
    if (events === null) {
        console.log("[Gateway] Resume: no replay data available");
        await Send(this, { op: OPCODES.Invalid_Session, d: false });
        return;
    }

    // Restore session state on this socket
    this.user_id = tokenData.user.id;
    this.session_id = resume.session_id;
    this.accessToken = resume.token;
    this.sequence = resume.seq;

    // Clear the ready timeout since we've authenticated via resume
    if (this.readyTimeout) clearTimeout(this.readyTimeout);

    // Reset heartbeat
    setHeartbeat(this);

    console.log(`[Gateway] Resume: replaying ${events.length} events for session ${resume.session_id}`);

    // Replay missed events
    for (const event of events) {
        await Send(this, event);
    }

    // Send RESUMED event
    await Send(this, {
        op: OPCODES.Dispatch,
        t: "RESUMED",
        d: {},
        s: this.sequence++,
    });
}
