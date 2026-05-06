export const CROSSPOSTED_MESSAGE_FLAG = 1;
export const CROSSPOSTABLE_CHANNEL_TYPE = 5;
export const CROSSPOSTABLE_MESSAGE_TYPE = 0;

export type CrosspostRejectionReason = "channel_type" | "message_type";

export function getCrosspostRejectionReason(channelType: number, messageType: number): CrosspostRejectionReason | undefined {
    if (channelType !== CROSSPOSTABLE_CHANNEL_TYPE) return "channel_type";
    if (messageType !== CROSSPOSTABLE_MESSAGE_TYPE) return "message_type";
}

export function markMessageCrossposted(flags: number) {
    return flags | CROSSPOSTED_MESSAGE_FLAG;
}
