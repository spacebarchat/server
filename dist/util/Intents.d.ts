import { BitField } from "./BitField";
export declare class Intents extends BitField {
    static FLAGS: {
        GUILDS: bigint;
        GUILD_MEMBERS: bigint;
        GUILD_BANS: bigint;
        GUILD_EMOJIS: bigint;
        GUILD_INTEGRATIONS: bigint;
        GUILD_WEBHOOKS: bigint;
        GUILD_INVITES: bigint;
        GUILD_VOICE_STATES: bigint;
        GUILD_PRESENCES: bigint;
        GUILD_MESSAGES: bigint;
        GUILD_MESSAGE_REACTIONS: bigint;
        GUILD_MESSAGE_TYPING: bigint;
        DIRECT_MESSAGES: bigint;
        DIRECT_MESSAGE_REACTIONS: bigint;
        DIRECT_MESSAGE_TYPING: bigint;
    };
}
