import "missing-native-js-functions";
import db from "./Database";
import { DefaultOptions } from "./Constants";
import { ProviderCache } from "lambert-db";
var Config: ProviderCache;

async function init() {
	Config = db.data.config({}).cache();
	await Config.init();
	await Config.set(DefaultOptions.merge(Config.cache || {}));
}

function get() {
	return <DefaultOptions>Config.get();
}

function set(val: any) {
	return Config.set(val);
}

export default {
	init,
	get: get,
	set: set,
};
