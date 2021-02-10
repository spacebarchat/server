"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultOptions = void 0;
require("missing-native-js-functions");
const Database_1 = __importDefault(require("./Database"));
var Config;
exports.default = {
    init: async function init(opts = exports.DefaultOptions) {
        Config = await Database_1.default.data.config({}).cache();
        await Config.init();
        await Config.set(opts.merge(Config.cache || {}));
    },
    getAll: function get() {
        return Config.get();
    },
    setAll: function set(val) {
        return Config.set(val);
    },
};
exports.DefaultOptions = {
    api: {},
    gateway: {},
    voice: {},
};
//# sourceMappingURL=Config.js.map