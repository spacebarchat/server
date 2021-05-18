import { Config } from "@fosscord/server-util";

export default {
	init() {
		return Config.init({ gateway: DefaultOptions });
	},
	get() {
		return Config.getAll().gateway;
	},
	set(val: any) {
		return Config.setAll({ gateway: val });
	},
	getAll: Config.getAll,
	setAll: Config.setAll,
};

export interface DefaultOptions {
	endpoint?: string;
}

export const DefaultOptions: DefaultOptions = {};
