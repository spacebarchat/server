"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = void 0;
const Constants_1 = require("./Constants");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Config_1 = __importDefault(require("./Config"));
function checkToken(token) {
    return new Promise((res, rej) => {
        jsonwebtoken_1.default.verify(token, Config_1.default.getAll().api.security.jwtSecret, Constants_1.JWTOptions, (err, decoded) => {
            if (err || !decoded)
                return rej("Invalid Token");
            return res(decoded);
        });
    });
}
exports.checkToken = checkToken;
//# sourceMappingURL=checkToken.js.map