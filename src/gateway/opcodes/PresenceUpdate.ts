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
import { emitEvent, PresenceUpdateEvent, Session, User } from "@spacebar/util";
import { check } from "./instanceOf";
import { ActivitySchema } from "@spacebar/schemas";

export async function onPresenceUpdate(this: WebSocket, { d }: Payload) {
    const startTime = Date.now();
    check.call(this, ActivitySchema, d);
    const presence = d as ActivitySchema;

    const statusValues = ["online", "idle", "dnd", "invisible"] as const;
    type StatusValue = (typeof statusValues)[number];

    const incomingStatus = presence.status as string | undefined;
    const nextStatus = statusValues.includes(incomingStatus as StatusValue) ? (incomingStatus as StatusValue) : undefined;

    const updatePayload: { status?: StatusValue; activities?: ActivitySchema["activities"] } = {
        activities: presence.activities,
    };

    if (incomingStatus !== "unknown" && nextStatus) {
        updatePayload.status = nextStatus;
    }

    await Session.update({ session_id: this.session_id }, updatePayload);

    const session = await Session.findOne({
        where: { session_id: this.session_id },
    });

    await emitEvent({
        event: "PRESENCE_UPDATE",
        user_id: this.user_id,
        data: {
            user: await User.getPublicUser(this.user_id),
            status: session?.getPublicStatus() ?? "offline",
            activities: session?.activities ?? [],
            client_status: session?.client_status ?? {},
        },
    } satisfies PresenceUpdateEvent);

    console.log(`Presence update for user ${this.user_id} processed in ${Date.now() - startTime}ms`);
}
