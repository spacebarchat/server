"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertBigIntToString = void 0;
require("missing-native-js-functions");
function convertBigIntToString(obj) {
    if (typeof obj === "bigint")
        obj = obj.toString();
    if (typeof obj === "object") {
        obj.keys().forEach((key) => {
            obj[key] = convertBigIntToString(obj[key]);
        });
    }
    return obj;
}
exports.convertBigIntToString = convertBigIntToString;
//# sourceMappingURL=convertBigIntToString.js.map