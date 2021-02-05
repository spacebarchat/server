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
exports.IdentifySchema = exports.ActivitySchema = exports.EmojiSchema = exports.DefaultOptions = exports.db = exports.Constants = exports.Config = exports.checkToken = void 0;
const checkToken_1 = require("./util/checkToken");
Object.defineProperty(exports, "checkToken", { enumerable: true, get: function () { return checkToken_1.checkToken; } });
const Config_1 = __importStar(require("./util/Config"));
exports.Config = Config_1.default;
Object.defineProperty(exports, "DefaultOptions", { enumerable: true, get: function () { return Config_1.DefaultOptions; } });
const Database_1 = __importDefault(require("./util/Database"));
exports.db = Database_1.default;
const Constants = __importStar(require("./util/Constants"));
exports.Constants = Constants;
const Emoji_1 = require("./Schema/Emoji");
Object.defineProperty(exports, "EmojiSchema", { enumerable: true, get: function () { return Emoji_1.EmojiSchema; } });
const Activity_1 = require("./Schema/Activity");
Object.defineProperty(exports, "ActivitySchema", { enumerable: true, get: function () { return Activity_1.ActivitySchema; } });
const Identify_1 = require("./Schema/Identify");
Object.defineProperty(exports, "IdentifySchema", { enumerable: true, get: function () { return Identify_1.IdentifySchema; } });
//# sourceMappingURL=index.js.map