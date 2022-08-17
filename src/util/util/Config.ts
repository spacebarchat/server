import fs from "fs";
import { OrmUtils } from ".";
import { ConfigValue } from "../config";
import { ConfigEntity } from "../entities/Config";

const overridePath = process.env.CONFIG_PATH ?? "";

let config: ConfigValue;
let pairs: ConfigEntity[];

// TODO: use events to inform about config updates
// Config keys are separated with _

export const Config = {
	init: async function init() {
		if (config) return config;
		console.log("[Config] Loading configuration...");
		pairs = await ConfigEntity.find();
		config = pairsToConfig(pairs);
		//config = (config || {}).merge(new ConfigValue());
		config = OrmUtils.mergeDeep(new ConfigValue(), config);

		if (process.env.CONFIG_PATH)
			try {
				const overrideConfig = JSON.parse(fs.readFileSync(overridePath, { encoding: "utf8" }));
				config = overrideConfig.merge(config);
			} catch (error) {
				fs.writeFileSync(overridePath, JSON.stringify(config, null, 4));
			}

		return this.set(config);
	},
	get: function get() {
		if (!config) {
			if (/--debug|--inspect/.test(process.execArgv.join(" ")))
				console.log(
					"Oops.. trying to get config without config existing... Returning defaults... (Is the database still initialising?)"
				);
			return new ConfigValue();
		}
		return config;
	},
	set: function set(val: Partial<ConfigValue>) {
		if (!config || !val) return;
		config = val.merge(config);

		return applyConfig(config);
	}
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
	if (process.env.CONFIG_PATH) {
		if (/--debug|--inspect/.test(process.execArgv.join(" "))) console.log(`Writing config: ${process.env.CONFIG_PATH}`);
		fs.writeFileSync(overridePath, JSON.stringify(val, null, 4));
	}

	return apply(val);
}

function pairsToConfig(pairs: ConfigEntity[]) {
	let value: any = {};

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
