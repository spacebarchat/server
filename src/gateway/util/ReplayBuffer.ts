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

import { Payload } from "./Constants";

/**
 * In-memory replay buffer for Gateway Resume.
 * Stores dispatched events per session so they can be replayed on resume.
 * Each session keeps the last MAX_REPLAY_EVENTS events.
 * Sessions are cleaned up after SESSION_TIMEOUT_MS of inactivity.
 */

const MAX_REPLAY_EVENTS = 2048;
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface ReplaySession {
    events: Payload[];
    lastActivity: number;
    userId: string;
    accessToken: string;
}

const replaySessions = new Map<string, ReplaySession>();

// Periodic cleanup of expired sessions
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of replaySessions) {
        if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
            replaySessions.delete(sessionId);
        }
    }
}, 60000); // cleanup every minute

/**
 * Store a dispatched event for potential replay on resume.
 */
export function storeReplayEvent(sessionId: string, userId: string, accessToken: string, payload: Payload): void {
    let session = replaySessions.get(sessionId);
    if (!session) {
        session = {
            events: [],
            lastActivity: Date.now(),
            userId,
            accessToken,
        };
        replaySessions.set(sessionId, session);
    }

    session.lastActivity = Date.now();
    session.events.push(payload);

    // Trim to max size
    if (session.events.length > MAX_REPLAY_EVENTS) {
        session.events = session.events.slice(-MAX_REPLAY_EVENTS);
    }
}

/**
 * Get events to replay for a resume request.
 * Returns events after the given sequence number, or null if session not found / expired.
 */
export function getReplayEvents(sessionId: string, sequence: number): Payload[] | null {
    const session = replaySessions.get(sessionId);
    if (!session) return null;

    // Return events with sequence > the client's last received sequence
    return session.events.filter((e) => e.s !== undefined && e.s > sequence);
}

/**
 * Get the session data for resume validation.
 */
export function getReplaySession(sessionId: string): ReplaySession | undefined {
    return replaySessions.get(sessionId);
}

/**
 * Remove a session's replay buffer (e.g., on explicit logout or permanent disconnect).
 */
export function deleteReplaySession(sessionId: string): void {
    replaySessions.delete(sessionId);
}

/**
 * Mark a session as disconnected (keeps the replay buffer alive for resume).
 */
export function markSessionDisconnected(sessionId: string): void {
    const session = replaySessions.get(sessionId);
    if (session) {
        session.lastActivity = Date.now();
    }
}
