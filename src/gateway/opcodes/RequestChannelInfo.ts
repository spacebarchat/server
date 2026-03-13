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
import { ChannelType } from "@spacebar/schemas";
import { Channel, Config } from "@spacebar/util";

export async function onRequestChannelInfo(this: WebSocket, { d }: Payload) {
    // Schema validation can only accept either string or array, so transforming it here to support both
    if (!d.guild_id) throw new Error('"guild_id" is required');
    if (!d.fields) throw new Error('"fields" is required');

    if (Config.get().offload.gateway.channelInfoUrl !== null) {
        return await handleOffloadedGatewayRequest(this, Config.get().offload.gateway.channelInfoUrl!, d);
    }

    const channels = (
        await Channel.find({
            where: { guild_id: d.guild_id, type: ChannelType.GUILD_VOICE },
            relations: {
                voice_states: true,
            },
        })
    ).filter((c) => c.voice_states && c.voice_states.length > 0);

    await Send(this, {
        op: OPCODES.Dispatch,
        t: "CHANNEL_INFO", // This is an educated guess...
        d: {
            guild_id: d.guild_id,
            channels: channels.map((c) => ({
                id: c.id,
                status: d.fields.includes("status") ? null : undefined, // TODO: we dont track this
                voice_start_time: d.fields.includes("voice_start_time") ? new Date().toISOString() : undefined, // TODO: we dont track this
            })),
        },
    });
}
