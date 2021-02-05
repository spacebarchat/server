"use strict";
// https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFlags = void 0;
const BitField_1 = require("./BitField");
class MessageFlags extends BitField_1.BitField {
}
exports.MessageFlags = MessageFlags;
MessageFlags.FLAGS = {
    CROSSPOSTED: 1n << 0n,
    IS_CROSSPOST: 1n << 1n,
    SUPPRESS_EMBEDS: 1n << 2n,
    SOURCE_MESSAGE_DELETED: 1n << 3n,
    URGENT: 1n << 4n,
};
//# sourceMappingURL=MessageFlags.js.map