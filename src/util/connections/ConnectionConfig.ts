import { ConnectionConfigEntity } from "../entities/ConnectionConfigEntity";

let config: any;
let pairs: ConnectionConfigEntity[];

export const ConnectionConfig = {
	init: async function init() {
		if (config) return config;
		console.log("[ConnectionConfig] Loading configuration...");
		pairs = await ConnectionConfigEntity.find();
		config = pairsToConfig(pairs);

		return this.set(config);
	},
	get: function get() {
		if (!config) {
			return {};
		}
		return config;
	},
	set: function set(val: Partial<any>) {
		if (!config || !val) return;
		config = val.merge(config);

		return applyConfig(config);
	},
};

function applyConfig(val: any) {
	async function apply(obj: any, key = ""): Promise<any> {
		if (typeof obj === "object" && obj !== null && !(obj instanceof Date))
			return Promise.all(
				Object.keys(obj).map((k) =>
					apply(obj[k], key ? `${key}_${k}` : k),
				),
			);

		let pair = pairs.find((x) => x.key === key);
		if (!pair) pair = new ConnectionConfigEntity();

		pair.key = key;

		if (pair.value !== obj) {
			pair.value = obj;
			if (!pair.key || pair.key == null) {
				console.log(`[ConnectionConfig] WARN: Empty key`);
				console.log(pair);
			} else return pair.save();
		}
	}

	return apply(val);
}

function pairsToConfig(pairs: ConnectionConfigEntity[]) {
	let value: any = {};

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

	return value;
}
