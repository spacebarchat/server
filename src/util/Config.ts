import { Schema, model, Types, Document } from "mongoose";
import "missing-native-js-functions";
import db, { MongooseCache } from "./Database";

var Config = new MongooseCache(db.collection("config"), [], { onlyEvents: false });

export default {
	init: async function init(defaultOpts: any = DefaultOptions) {
		await Config.init();
		return this.setAll(Config.data.merge(defaultOpts));
	},
	getAll: function get() {
		return <DefaultOptions>Config.data;
	},
	setAll: function set(val: any) {
		return db.collection("config").updateOne({}, { $set: val }, { upsert: true });
	},
};

export const DefaultOptions = {
	api: {},
	gateway: {},
	voice: {},
};

export interface DefaultOptions extends Document {
	api?: any;
	gateway?: any;
	voice?: any;
}

export const ConfigSchema = new Schema({
	api: Object,
	gateway: Object,
	voice: Object,
});

export const ConfigModel = model<DefaultOptions>("Config", ConfigSchema, "config");
