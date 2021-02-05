"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intents = void 0;
const BitField_1 = require("./BitField");
class Intents extends BitField_1.BitField {
}
exports.Intents = Intents;
Intents.FLAGS = {
    GUILDS: 1n << 0n,
    GUILD_MEMBERS: 1n << 1n,
    GUILD_BANS: 1n << 2n,
    GUILD_EMOJIS: 1n << 3n,
    GUILD_INTEGRATIONS: 1n << 4n,
    GUILD_WEBHOOKS: 1n << 5n,
    GUILD_INVITES: 1n << 6n,
    GUILD_VOICE_STATES: 1n << 7n,
    GUILD_PRESENCES: 1n << 8n,
    GUILD_MESSAGES: 1n << 9n,
    GUILD_MESSAGE_REACTIONS: 1n << 10n,
    GUILD_MESSAGE_TYPING: 1n << 11n,
    DIRECT_MESSAGES: 1n << 12n,
    DIRECT_MESSAGE_REACTIONS: 1n << 13n,
    DIRECT_MESSAGE_TYPING: 1n << 14n,
};
//# sourceMappingURL=Intents.js.map