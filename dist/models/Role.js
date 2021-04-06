"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = exports.RoleSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.RoleSchema = new mongoose_1.Schema({
    id: String,
    guild_id: String,
    color: Number,
    hoist: Boolean,
    managed: Boolean,
    mentionable: Boolean,
    name: String,
    permissions: mongoose_1.Types.Long,
    position: Number,
    tags: {
        bot_id: String,
    },
});
// @ts-ignore
exports.RoleModel = Database_1.default.model("Role", exports.RoleSchema, "roles");
//# sourceMappingURL=Role.js.map