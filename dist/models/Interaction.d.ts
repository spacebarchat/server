import { AllowedMentions, Embed } from "./Message";
export interface Interaction {
    id: bigint;
    type: InteractionType;
    data?: {};
    guild_id: bigint;
    channel_id: bigint;
    member_id: bigint;
    token: string;
    version: number;
}
export declare enum InteractionType {
    Ping = 1,
    ApplicationCommand = 2
}
export declare enum InteractionResponseType {
    Pong = 1,
    Acknowledge = 2,
    ChannelMessage = 3,
    ChannelMessageWithSource = 4,
    AcknowledgeWithSource = 5
}
export interface InteractionApplicationCommandCallbackData {
    tts?: boolean;
    content: string;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
}
