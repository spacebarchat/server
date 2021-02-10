"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimSpecial = exports.SPECIAL_CHAR = exports.DOUBLE_WHITE_SPACE = void 0;
exports.DOUBLE_WHITE_SPACE = /\s\s+/g;
exports.SPECIAL_CHAR = /[@#`:\r\n\t\f\v\p{C}]/gu;
function trimSpecial(str) {
    return str.replace(exports.SPECIAL_CHAR, "").replace(exports.DOUBLE_WHITE_SPACE, " ").trim();
}
exports.trimSpecial = trimSpecial;
//# sourceMappingURL=String.js.map