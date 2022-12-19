import { ConfigEntity } from "../entities/Config";
import fs from "fs";
import { ConfigValue } from "../config";

// TODO: yaml instead of json
const overridePath = process.env.CONFIG_PATH ?? "";

var config: ConfigValue;
var pairs: ConfigEntity[];

// TODO: use events to inform about config updates
// Config keys are separated with _

export const Config = {
	init: async function init() {
		if (config) return config;
		console.log('[Config] Loading configuration...')
		pairs = await ConfigEntity.find();
		config = pairsToConfig(pairs);
		// TODO: this overwrites existing config values with defaults.
		// we actually want to extend the object with new keys instead.
		// config = (config || {}).merge(new ConfigValue());

		if (process.env.CONFIG_PATH) {
			console.log(`[Config] Using config path from environment rather than database.`);
			try {
				const overrideConfig = JSON.parse(fs.readFileSync(overridePath, { encoding: "utf8" }));
				config = overrideConfig.merge(config);
			} catch (error) {
				fs.writeFileSync(overridePath, JSON.stringify(config, null, 4));
			}
		}


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
			return Promise.all(
				Object.keys(obj).map((k) =>
					apply(obj[k], key ? `${key}_${k}` : k),
				),
			);

		let pair = pairs.find((x) => x.key === key);
		if (!pair) pair = new ConfigEntity();

		pair.key = key;
		pair.value = obj;
		return pair.save();
	}

	if (process.env.CONFIG_PATH)
		fs.writeFileSync(overridePath, JSON.stringify(val, null, 4));

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
			if (!isNaN(Number(key)) && !prevObj[prev]?.length)
				prevObj[prev] = obj = [];
			if (i++ === keys.length - 1) obj[key] = p.value;
			else if (!obj[key]) obj[key] = {};

			prev = key;
			prevObj = obj;
			obj = obj[key];
		}
	});

	return value as ConfigValue;
}
