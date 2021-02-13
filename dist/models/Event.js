"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = exports.EventSchema = void 0;
const mongoose_1 = require("mongoose");
exports.EventSchema = new mongoose_1.Schema({
    guild_id: mongoose_1.Types.Long,
    user_id: mongoose_1.Types.Long,
    channel_id: mongoose_1.Types.Long,
    created_at: { type: Number, required: true },
    event: { type: String, required: true },
    data: Object,
});
exports.EventModel = mongoose_1.model("Event", exports.EventSchema, "events");
//# sourceMappingURL=Event.js.map