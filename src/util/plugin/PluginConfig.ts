import fs from "fs";
import { Environment } from "..";
import { PluginConfigEntity } from "../entities/PluginConfig";

// TODO: yaml instead of json
const overridePath = process.env.PLUGIN_CONFIG_PATH ?? "";

let config: any;
let pairs: PluginConfigEntity[];

// TODO: use events to inform about config updates
// Config keys are separated with _

export const PluginConfig = {
	init: async function init() {
		if (config) return config;
		console.log("[PluginConfig] Loading configuration...");
		pairs = await PluginConfigEntity.find();
		config = pairsToConfig(pairs);
		//config = (config || {}).merge(new ConfigValue());
		//config = OrmUtils.mergeDeep(new ConfigValue(), config)

		if (process.env.PLUGIN_CONFIG_PATH)
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
			if (Environment.isDebug)
				console.log(
					"Oops.. trying to get config without config existing... Returning defaults... (Is the database still initialising?)"
				);
			return {};
		}
		return config;
	},
	set: function set(val: Partial<any>) {
		if (!config || !val) return;
		config = val.merge(config);

		return applyConfig(config);
	}
};

function applyConfig(val: any) {
	async function apply(obj: any, key = ""): Promise<any> {
		if (typeof obj === "object" && obj !== null && !(obj instanceof Date))
			return Promise.all(Object.keys(obj).map((k) => apply(obj[k], key ? `${key}_${k}` : k)));

		let pair = pairs.find((x) => x.key === key);
		if (!pair) pair = new PluginConfigEntity();

		pair.key = key;
		pair.value = obj;
		if (!pair.key || pair.key == null) {
			console.log(`[PluginConfig] WARN: Empty key`);
			console.log(pair);
			if (Environment.isDebug) debugger;
		} else return pair.save();
	}
	if (process.env.PLUGIN_CONFIG_PATH) {
		if (Environment.isDebug) console.log(`Writing config: ${process.env.PLUGIN_CONFIG_PATH}`);
		fs.writeFileSync(overridePath, JSON.stringify(val, null, 4));
	}

	return apply(val);
}

function pairsToConfig(pairs: PluginConfigEntity[]) {
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

	return value;
}
