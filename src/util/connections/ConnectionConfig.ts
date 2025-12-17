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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConnectionConfigEntity } from "../entities/ConnectionConfigEntity";
import { OrmUtils } from "../imports";

let config: any;
let pairs: ConnectionConfigEntity[];

export const ConnectionConfig = {
	init: async function init() {
		if (config) return config;
		console.log("[Connections] Loading configuration...");
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
		config = OrmUtils.mergeDeep(config, val);

		// return applyConfig(config);
		return applyConfig(val);
	},
};

function applyConfig(val: any) {
	async function apply(obj: any, key = ""): Promise<any> {
		if (typeof obj === "object" && obj !== null && !(obj instanceof Date)) return Promise.all(Object.keys(obj).map((k) => apply(obj[k], key ? `${key}_${k}` : k)));

		let pair = pairs.find((x) => x.key === key);
		if (!pair) pair = new ConnectionConfigEntity();

		pair.key = key;

		if (pair.value !== obj) {
			pair.value = obj;
			if (!pair.key || pair.key == null) {
				console.log(`[Connections] WARN: Empty config key`);
				console.log(pair);
			} else return pair.save();
		}
	}

	return apply(val);
}

function pairsToConfig(pairs: ConnectionConfigEntity[]) {
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

	return value;
}
