"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = exports.RoleSchema = void 0;
const mongoose_1 = require("mongoose");
exports.RoleSchema = new mongoose_1.Schema({
    id: mongoose_1.Types.Long,
    color: Number,
    hoist: Boolean,
    managed: Boolean,
    mentionable: Boolean,
    name: String,
    permissions: mongoose_1.Types.Long,
    position: Number,
    tags: {
        bot_id: mongoose_1.Types.Long,
    },
});
exports.RoleModel = mongoose_1.model("Role", exports.RoleSchema, "roles");
//# sourceMappingURL=Role.js.map