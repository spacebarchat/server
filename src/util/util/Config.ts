import "missing-native-js-functions";
import { ConfigValue, ConfigEntity, DefaultConfigOptions } from "../entities/Config";
import path from "path";
import fs from "fs";

// TODO: yaml instead of json
// const overridePath = path.join(process.cwd(), "config.json");

var config: ConfigValue;
var pairs: ConfigEntity[];

// TODO: use events to inform about config updates
// Config keys are separated with _

export const Config = {
	init: async function init() {
		if (config) return config;
		pairs = await ConfigEntity.find();
		config = pairsToConfig(pairs);
		config = (config || {}).merge(DefaultConfigOptions);

		// try {
		// 	const overrideConfig = JSON.parse(fs.readFileSync(overridePath, { encoding: "utf8" }));
		// 	config = overrideConfig.merge(config);
		// } catch (error) {
		// 	fs.writeFileSync(overridePath, JSON.stringify(config, null, 4));
		// }

		return this.set(config);
	},
	get: function get() {
		return config;
	},
	set: function set(val: Partial<ConfigValue>) {
		if (!config || !val) return;
		config = val.merge(config);

		return applyConfig(config);
	},
};

function applyConfig(val: ConfigValue) {
	async function apply(obj: any, key = ""): Promise<any> {
		if (typeof obj === "object" && obj !== null)
			return Promise.all(Object.keys(obj).map((k) => apply(obj[k], key ? `${key}_${k}` : k)));

		let pair = pairs.find((x) => x.key === key);
		if (!pair) pair = new ConfigEntity();

		pair.key = key;
		pair.value = obj;
		return pair.save();
	}
	// fs.writeFileSync(overridePath, JSON.stringify(val, null, 4));

	return apply(val);
}

function pairsToConfig(pairs: ConfigEntity[]) {
	var value: any = {};

	pairs.forEach((p) => {
		const keys = p.key.split("_");
		let obj = value;
		let prev = "";
		let prevObj = obj;
		let i = 0;

		for (const key of keys) {
			if (!isNaN(Number(key)) && !prevObj[prev]?.length) prevObj[prev] = obj = [];
			if (i++ === keys.length - 1) obj[key] = p.value;
			else if (!obj[key]) obj[key] = {};

			prev = key;
			prevObj = obj;
			obj = obj[key];
		}
	});

	return value as ConfigValue;
}
