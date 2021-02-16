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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModel = exports.ConfigSchema = exports.DefaultOptions = void 0;
const mongoose_1 = require("mongoose");
require("missing-native-js-functions");
const Database_1 = __importStar(require("./Database"));
var Config = new Database_1.MongooseCache(Database_1.default.collection("config"), [], { onlyEvents: false });
exports.default = {
    init: async function init(defaultOpts = exports.DefaultOptions) {
        await Config.init();
        return this.setAll(Config.data.merge(defaultOpts));
    },
    getAll: function get() {
        return Config.data;
    },
    setAll: function set(val) {
        return Database_1.default.collection("config").updateOne({}, { $set: val }, { upsert: true });
    },
};
exports.DefaultOptions = {
    api: {},
    gateway: {},
    voice: {},
};
exports.ConfigSchema = new mongoose_1.Schema({
    api: Object,
    gateway: Object,
    voice: Object,
});
exports.ConfigModel = mongoose_1.model("Config", exports.ConfigSchema, "config");
//# sourceMappingURL=Config.js.map