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

import { CLOSECODES } from "./Constants";
import { WebSocket } from "./WebSocket";

// TODO: make heartbeat timeout configurable
export function setHeartbeat(socket: WebSocket) {
    if (socket.heartbeatTimeout) clearTimeout(socket.heartbeatTimeout);

    socket.heartbeatTimeout = setTimeout(() => {
        return socket.close(CLOSECODES.Session_timed_out);
    }, 1000 * 45);
}

const HEALTH_CHECK_INTERVAL = 30 * 1000;
const MAX_INACTIVITY_TIME = 5 * 60 * 1000;

export function startHealthCheck(socket: WebSocket) {
    if (socket.healthCheckInterval) clearInterval(socket.healthCheckInterval);

    socket.healthCheckInterval = setInterval(() => {
        performHealthCheck(socket);
    }, HEALTH_CHECK_INTERVAL);
}

function performHealthCheck(socket: WebSocket) {
    const now = Date.now();
    const timeSinceLastActivity = now - socket.lastActivity;

    // check if socket is still connected and responsive
    if (socket.readyState !== 1) {
        console.warn(`[Gateway] Health check failed: socket not ready (readyState: ${socket.readyState}) for user ${socket.user_id || "unknown"}`);
        socket.isHealthy = false;
        socket.close(CLOSECODES.Unknown_error, "Connection became unresponsive");
        return;
    }

    // Check for inactivity
    if (timeSinceLastActivity > MAX_INACTIVITY_TIME) {
        console.warn(`[Gateway] Health check failed: no activity for ${timeSinceLastActivity / 1000}s for user ${socket.user_id || "unknown"}`);
        socket.isHealthy = false;
        socket.close(CLOSECODES.Session_timed_out, "Connection inactive");
        return;
    }

    if (socket.user_id && Object.keys(socket.events).length === 0) {
        console.warn(`[Gateway] Health check failed: no event listeners for user ${socket.user_id}`);
        socket.isHealthy = false;
        socket.close(CLOSECODES.Unknown_error, "Event listeners lost");
        return;
    }

    socket.isHealthy = true;
}

export function updateActivity(socket: WebSocket) {
    socket.lastActivity = Date.now();
}
