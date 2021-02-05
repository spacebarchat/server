"use strict";
// https://github.com/discordjs/discord.js/blob/master/src/util/UserFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFlags = void 0;
const BitField_1 = require("./BitField");
class UserFlags extends BitField_1.BitField {
}
exports.UserFlags = UserFlags;
UserFlags.FLAGS = {
    DISCORD_EMPLOYEE: 1n << 0n,
    PARTNERED_SERVER_OWNER: 1n << 1n,
    HYPESQUAD_EVENTS: 1n << 2n,
    BUGHUNTER_LEVEL_1: 1n << 3n,
    HOUSE_BRAVERY: 1n << 6n,
    HOUSE_BRILLIANCE: 1n << 7n,
    HOUSE_BALANCE: 1n << 8n,
    EARLY_SUPPORTER: 1n << 9n,
    TEAM_USER: 1n << 10n,
    SYSTEM: 1n << 12n,
    BUGHUNTER_LEVEL_2: 1n << 14n,
    VERIFIED_BOT: 1n << 16n,
    EARLY_VERIFIED_BOT_DEVELOPER: 1n << 17n,
};
//# sourceMappingURL=UserFlags.js.map