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

import { WebSocket, Payload, CLOSECODES } from "@spacebar/gateway";
import { emitEvent, PresenceUpdateEvent, Session, User } from "@spacebar/util";
import { check } from "./instanceOf";
import { ActivitySchema } from "@spacebar/schemas";

export async function onPresenceUpdate(this: WebSocket, { d }: Payload) {
    check.call(this, ActivitySchema, d);
    const presence = d as ActivitySchema;

    if (!this.session) {
        return this.close(CLOSECODES.Not_authenticated);
    }

    const session = this.session;
    const platform = session.client_info?.platform?.toLowerCase() || "web";
    let clientType: "desktop" | "mobile" | "web" | "embedded" = "web";
    if (platform.includes("mobile") || platform.includes("ios") || platform.includes("android")) {
        clientType = "mobile";
    } else if (platform.includes("desktop") || platform.includes("windows") || platform.includes("linux") || platform.includes("mac")) {
        clientType = "desktop";
    } else if (platform.includes("embedded")) {
        clientType = "embedded";
    }

    session.status = presence.status || "unknown";
    session.activities = presence.activities ?? [];

    if (!session.client_status || typeof session.client_status !== "object") {
        session.client_status = {};
    }

    session.client_status = {
        ...session.client_status,
        [clientType]: presence.status,
    };

    // to match the DB row
    await Session.update(
        { session_id: session.session_id },
        {
            status: session.status,
            activities: session.activities,
            client_status: session.client_status,
        },
    );

    await emitEvent({
        event: "PRESENCE_UPDATE",
        user_id: this.user_id,
        data: {
            user: await User.getPublicUser(this.user_id),
            status: session.getPublicStatus(),
            activities: Array.isArray(session.activities) ? session.activities : [],
            client_status: session.client_status && typeof session.client_status === "object" ? session.client_status : {},
        },
    } as PresenceUpdateEvent);
}
