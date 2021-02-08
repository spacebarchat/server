import "missing-native-js-functions";
import db from "./Database";
import { ProviderCache } from "lambert-db";
var Config: ProviderCache;

export default {
	init: async function init(opts: DefaultOptions = DefaultOptions) {
		Config = await db.data.config({}).cache();
		await Config.init();
		await Config.set(opts.merge(Config.cache || {}));
	},
	getAll: function get() {
		return <DefaultOptions>Config.get();
	},
	setAll: function set(val: any) {
		return Config.set(val);
	},
};

export interface DefaultOptions {
	api?: any;
	gateway?: any;
	voice?: any;
}

export const DefaultOptions: DefaultOptions = {
	api: {},
	gateway: {},
	voice: {},
};
