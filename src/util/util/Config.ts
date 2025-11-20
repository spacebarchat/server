/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { existsSync } from "fs";
import fs from "fs/promises";
import { OrmUtils } from "..";
import { ConfigValue } from "../config";
import { ConfigEntity } from "../entities/Config";

// TODO: yaml instead of json
const overridePath = process.env.CONFIG_PATH ?? "";

let config: ConfigValue;
let pairs: ConfigEntity[];

// TODO: use events to inform about config updates
// Config keys are separated with _

export class Config {
	public static async init(force: boolean = false) {
		if (config && !force) return config;
		console.log("[Config] Loading configuration...");
		if (!process.env.CONFIG_PATH) {
			pairs = await validateConfig();
			config = pairsToConfig(pairs);
		} else {
			console.log(`[Config] Using CONFIG_PATH rather than database`);
			if (existsSync(process.env.CONFIG_PATH)) {
				const file = JSON.parse((await fs.readFile(process.env.CONFIG_PATH)).toString());
				config = file;
			} else config = new ConfigValue();
			pairs = generatePairs(config);
		}

		// If a config doesn't exist, create it.
		if (Object.keys(config).length == 0) config = new ConfigValue();

		config = OrmUtils.mergeDeep({}, { ...new ConfigValue() }, config);
		config.cdn.endpointPrivate = "http://localhost:3001";
		config.cdn.endpointPublic = "http://localhost:3001";
		config.cdn.endpointClient = "http://localhost:3001";

		return this.set(config);
	}
	public static get() {
		if (!config) {
			// If we haven't initialised the config yet, return default config.
			// Typeorm instantiates each entity once when initialising database,
			// which means when we use config values as default values in entity classes,
			// the config isn't initialised yet and would throw an error about the config being undefined.

			return new ConfigValue();
		}

		return config;
	}
	public static set(val: Partial<ConfigValue>) {
		if (!config || !val) return;
		config = OrmUtils.mergeDeep(config);

		return applyConfig(config);
	}
}

// TODO: better types
const generatePairs = (obj: object | null, key = ""): ConfigEntity[] => {
	if (typeof obj == "object" && obj != null) {
		return Object.keys(obj)
			.map((k) =>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				generatePairs((obj as any)[k], key ? `${key}_${k}` : k),
			)
			.flat();
	}

	const ret = new ConfigEntity();
	ret.key = key;
	ret.value = obj;
	return [ret];
};

async function applyConfig(val: ConfigValue) {
	if (process.env.CONFIG_PATH)
		if (!process.env.CONFIG_READONLY) await fs.writeFile(overridePath, JSON.stringify(val, null, 4));
		else console.log("[WARNING] JSON config file in use, and writing is disabled! Programmatic config changes will not be persisted, and your config will not get updated!");
	else {
		const pairs = generatePairs(val);
		// keys are sorted to try to influence database order...
		await Promise.all(pairs.sort((x, y) => (x.key > y.key ? 1 : -1)).map((pair) => pair.save()));
	}
	return val;
}

function pairsToConfig(pairs: ConfigEntity[]) {
	// TODO: typings
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const value: any = {};

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

const validateConfig = async () => {
	let hasErrored = false;
	const totalStartTime = new Date();
	const config = await ConfigEntity.find({ select: { key: true } });

	for (const row in config) {
		// extension methods...
		if (typeof config[row] === "function") continue;

		try {
			const found = await ConfigEntity.findOne({
				where: { key: config[row].key },
			});
			if (!found) continue;
			config[row] = found;
		} catch (e) {
			console.error(`Config key '${config[row].key}' has invalid JSON value : ${(e as Error)?.message}`);
			hasErrored = true;
		}
	}

	console.log("[Config] Total config load time:", new Date().getTime() - totalStartTime.getTime(), "ms");

	if (hasErrored) {
		console.error("[Config] Your config has invalid values. Fix them first https://docs.spacebar.chat/setup/server/configuration");
		process.exit(1);
	}

	return config;
};
