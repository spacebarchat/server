import { MongoDatabase } from "lambert-db";

// TODO: load url from config
const db = new MongoDatabase("mongodb://127.0.0.1:27017/lambert?readPreference=secondaryPreferred");

export default db;
