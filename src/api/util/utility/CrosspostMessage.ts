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
import { DiscordApiErrors } from "../../../util/util/Constants";
import { MessageFlags } from "../../../util/util/MessageFlags";

export const CROSSPOST_BASE_PERMISSION = "VIEW_CHANNEL" as const;
export const CROSSPOST_SEND_PERMISSION = "SEND_MESSAGES" as const;
export const CROSSPOST_MANAGE_PERMISSION = "MANAGE_MESSAGES" as const;
export const CROSSPOSTED_MESSAGE_FLAG = Number(MessageFlags.FLAGS.CROSSPOSTED);
export const CROSSPOSTABLE_CHANNEL_TYPE = ChannelType.GUILD_NEWS;
export const CROSSPOSTABLE_MESSAGE_TYPE = MessageType.DEFAULT;

export type CrosspostRejectionReason = "channel_type" | "message_type" | "already_crossposted";
export type CrosspostMessagePermission = typeof CROSSPOST_SEND_PERMISSION | typeof CROSSPOST_MANAGE_PERMISSION;

export interface CrosspostChannelData {
    type: ChannelType;
}

export interface CrosspostMessageData<TJson> {
    author_id?: string;
    type: MessageType;
    flags: number;
    save(): Promise<unknown>;
    toJSON(): TJson;
}

export interface CrosspostPermissionGuard {
    hasThrow(permission: CrosspostMessagePermission): unknown;
}

export interface CrosspostRightsGuard {
    has(permission: typeof CROSSPOST_MANAGE_PERMISSION): boolean;
}

export interface CrosspostMessageOptions<TJson> {
    channel: CrosspostChannelData;
    channelId: string;
    emitEvent(event: { event: "MESSAGE_UPDATE"; channel_id: string; data: TJson }): Promise<unknown> | unknown;
    getRights?(userId: string): Promise<CrosspostRightsGuard> | CrosspostRightsGuard;
    message: CrosspostMessageData<TJson>;
    permission: CrosspostPermissionGuard;
    userId: string;
}

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

export function shouldRequireCrosspostManagePermission(messageAuthorId: string | undefined, userId: string) {
    return !messageAuthorId || messageAuthorId !== userId;
}

export async function crosspostMessage<TJson>({ channel, channelId, emitEvent, getRights, message, permission, userId }: CrosspostMessageOptions<TJson>): Promise<TJson> {
    const rejectionReason = getCrosspostRejectionReason(channel.type, message.type, message.flags);
    if (rejectionReason === "channel_type") throw DiscordApiErrors.CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE;
    if (rejectionReason === "message_type") throw DiscordApiErrors.CANNOT_EXECUTE_ON_SYSTEM_MESSAGE;
    if (rejectionReason === "already_crossposted") throw DiscordApiErrors.ALREADY_CROSSPOSTED;

    if (shouldRequireCrosspostManagePermission(message.author_id, userId)) {
        const rights = await getRights?.(userId);
        if (!rights?.has(CROSSPOST_MANAGE_PERMISSION)) {
            permission.hasThrow(CROSSPOST_MANAGE_PERMISSION);
        }
    } else {
        permission.hasThrow(CROSSPOST_SEND_PERMISSION);
    }

    const nextFlags = markMessageCrossposted(message.flags);
    if (nextFlags !== message.flags) {
        message.flags = nextFlags;
        await message.save();
        const response = message.toJSON();
        await emitEvent({
            event: "MESSAGE_UPDATE",
            channel_id: channelId,
            data: response,
        });
        return response;
    }

    return message.toJSON();
}
