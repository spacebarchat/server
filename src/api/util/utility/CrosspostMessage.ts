/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { ChannelType } from "../../../schemas/api/channels/Channel";
import { MessageType } from "../../../schemas/api/messages/Message";
import { MessageFlags } from "../../../util/util/MessageFlags";

export const CROSSPOSTED_MESSAGE_FLAG = Number(MessageFlags.FLAGS.CROSSPOSTED);
export const CROSSPOSTABLE_CHANNEL_TYPE = ChannelType.GUILD_NEWS;
export const CROSSPOSTABLE_MESSAGE_TYPE = MessageType.DEFAULT;

export type CrosspostRejectionReason = "channel_type" | "message_type" | "already_crossposted";

export function getCrosspostRejectionReason(channelType: ChannelType, messageType: MessageType, flags: number): CrosspostRejectionReason | undefined {
    if (channelType !== CROSSPOSTABLE_CHANNEL_TYPE) return "channel_type";
    if (messageType !== CROSSPOSTABLE_MESSAGE_TYPE) return "message_type";
    if (isMessageCrossposted(flags)) return "already_crossposted";
}

export function isMessageCrossposted(flags: number) {
    return new MessageFlags(flags).has("CROSSPOSTED");
}

export function markMessageCrossposted(flags: number) {
    return Number(new MessageFlags(flags).add("CROSSPOSTED").bitfield);
}
