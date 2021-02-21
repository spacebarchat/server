"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = exports.EventSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.EventSchema = new mongoose_1.Schema({
    guild_id: mongoose_1.Types.Long,
    user_id: mongoose_1.Types.Long,
    channel_id: mongoose_1.Types.Long,
    created_at: { type: Date, required: true },
    event: { type: String, required: true },
    data: Object,
});
// @ts-ignore
exports.EventModel = Database_1.default.model("Event", exports.EventSchema, "events");
//# sourceMappingURL=Event.js.map