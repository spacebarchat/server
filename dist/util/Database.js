"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lambert_db_1 = require("lambert-db");
// TODO: load url from config
const db = new lambert_db_1.MongoDatabase("mongodb://127.0.0.1:27017/lambert?readPreference=secondaryPreferred");
exports.default = db;
//# sourceMappingURL=Database.js.map