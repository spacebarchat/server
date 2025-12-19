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

    await Session.update({ session_id: this.session_id }, { status: presence.status, activities: presence.activities });

    const session = await Session.findOneOrFail({
        select: { client_status: true },
        where: { session_id: this.session_id },
    });

    await emitEvent({
        event: "PRESENCE_UPDATE",
        user_id: this.user_id,
        data: {
            user: await User.getPublicUser(this.user_id),
            status: session.getPublicStatus(),
            activities: presence.activities,
            client_status: session.client_status,
        },
    } as PresenceUpdateEvent);

    console.log(`Presence update for user ${this.user_id} processed in ${Date.now() - startTime}ms`);
}
