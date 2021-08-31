import "missing-native-js-functions";
import { ConfigValue, ConfigEntity, DefaultConfigOptions } from "../entities/Config";

var config: ConfigEntity;
// TODO: use events to inform about config updates

export const Config = {
	init: async function init() {
		if (config) return config;
		config = (await ConfigEntity.findOne({ id: "0" })) || new ConfigEntity({ id: "0" });

		return this.set((config.value || {}).merge(DefaultConfigOptions));
	},
	get: function get() {
		return config.value as ConfigValue;
	},
	set: function set(val: any) {
		if (!config) return;
		config.value = val.merge(config?.value || {});
		return config.save();
	},
};
