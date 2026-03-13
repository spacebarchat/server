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

import { WebSocket, Payload, OPCODES, Send, handleOffloadedGatewayRequest } from "@spacebar/gateway";
import { Config } from "@spacebar/util";

export async function onRequestChannelStatuses(this: WebSocket, { d }: Payload) {
    // Schema validation can only accept either string or array, so transforming it here to support both
    if (!d.guild_id) throw new Error('"guild_id" is required');

    if (Config.get().offload.gateway.channelStatusesUrl !== null) {
        return await handleOffloadedGatewayRequest(this, Config.get().offload.gateway.channelStatusesUrl!, d);
    }

    // TODO: implement
    await Send(this, {
        op: OPCODES.Dispatch,
        t: "CHANNEL_STATUSES",
        d: {
            guild_id: d.guild_id,
            channels: [],
        },
    });
}
