"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteModel = exports.InviteSchema = void 0;
const mongoose_1 = require("mongoose");
exports.InviteSchema = new mongoose_1.Schema({
    code: String,
    temporary: Boolean,
    uses: Number,
    max_uses: Number,
    max_age: Number,
    created_at: Number,
    guild: {
        id: mongoose_1.Types.Long,
        name: String,
        splash: String,
        description: String,
        icon: String,
        features: Object,
        verification_level: Number,
    },
    channel: {
        id: mongoose_1.Types.Long,
        name: String,
        type: Number,
    },
    inviter: {
        id: mongoose_1.Types.Long,
        username: String,
        avatar: String,
        discriminator: Number,
    },
    target_user: {
        id: mongoose_1.Types.Long,
        username: String,
        avatar: String,
        discriminator: Number,
    },
    target_user_type: Number,
});
exports.InviteModel = mongoose_1.model("Invite", exports.InviteSchema, "invites");
//# sourceMappingURL=Invite.js.map