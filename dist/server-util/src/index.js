"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intents = exports.Snowflake = exports.UserFlags = exports.MessageFlags = exports.Permissions = exports.DefaultOptions = exports.BitField = exports.db = exports.Constants = exports.Config = exports.checkToken = exports.trimSpecial = void 0;
const checkToken_1 = require("./util/checkToken");
Object.defineProperty(exports, "checkToken", { enumerable: true, get: function () { return checkToken_1.checkToken; } });
const Config_1 = __importStar(require("./util/Config"));
exports.Config = Config_1.default;
Object.defineProperty(exports, "DefaultOptions", { enumerable: true, get: function () { return Config_1.DefaultOptions; } });
const Database_1 = __importDefault(require("./util/Database"));
exports.db = Database_1.default;
const Constants = __importStar(require("./util/Constants"));
exports.Constants = Constants;
const String_1 = require("./util/String");
Object.defineProperty(exports, "trimSpecial", { enumerable: true, get: function () { return String_1.trimSpecial; } });
const BitField_1 = require("./util/BitField");
Object.defineProperty(exports, "BitField", { enumerable: true, get: function () { return BitField_1.BitField; } });
const Intents_1 = require("./util/Intents");
Object.defineProperty(exports, "Intents", { enumerable: true, get: function () { return Intents_1.Intents; } });
const MessageFlags_1 = require("./util/MessageFlags");
Object.defineProperty(exports, "MessageFlags", { enumerable: true, get: function () { return MessageFlags_1.MessageFlags; } });
const Permissions_1 = require("./util/Permissions");
Object.defineProperty(exports, "Permissions", { enumerable: true, get: function () { return Permissions_1.Permissions; } });
const Snowflake_1 = require("./util/Snowflake");
Object.defineProperty(exports, "Snowflake", { enumerable: true, get: function () { return Snowflake_1.Snowflake; } });
const UserFlags_1 = require("./util/UserFlags");
Object.defineProperty(exports, "UserFlags", { enumerable: true, get: function () { return UserFlags_1.UserFlags; } });
//# sourceMappingURL=index.js.map