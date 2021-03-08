"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteModel = exports.InviteSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.InviteSchema = new mongoose_1.Schema({
    code: String,
    temporary: Boolean,
    uses: Number,
    max_uses: Number,
    max_age: Number,
    created_at: Date,
    guild_id: mongoose_1.Types.Long,
    channel_id: mongoose_1.Types.Long,
    inviter_id: mongoose_1.Types.Long,
    //! What the fucking shit is this
    target_user_id: mongoose_1.Types.Long,
    target_user_type: Number,
});
// @ts-ignore
exports.InviteModel = Database_1.default.model("Invite", exports.InviteSchema, "invites");
//# sourceMappingURL=Invite.js.map