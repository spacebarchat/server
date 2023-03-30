/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntityMetadata, FindOptionsWhere } from "typeorm";
import { LocalCache } from "./LocalCache";

declare module "typeorm" {
	interface BaseEntity {
		metadata?: EntityMetadata;
		cache: CacheManager;
	}
}

export type BaseEntityWithId = { id: string; [name: string]: any };
export type Criteria =
	| string
	| string[]
	| number
	| number[]
	| FindOptionsWhere<never>;

export interface Cache {
	get(id: string): BaseEntityWithId | undefined;
	set(id: string, entity: BaseEntityWithId): this;
	find(options: Record<string, never>): BaseEntityWithId | undefined;
	filter(options: Record<string, never>): BaseEntityWithId[];
	delete(id: string): boolean;
}

export class CacheManager {
	// last access time to automatically remove old entities from cache after 5 minutes of inactivity (to prevent memory leaks)
	cache: Cache;

	constructor() {
		this.cache = new LocalCache();
		// TODO: Config.get().cache.redis;
	}

	delete(id: string) {
		return this.cache.delete(id);
	}

	insert(entity: BaseEntityWithId) {
		if (!entity.id) return;

		return this.cache.set(entity.id, entity);
	}

	find(options?: Record<string, never>, select?: string[] | undefined) {
		if (!options) return null;
		const entity = this.cache.find(options);
		if (!entity) return null;
		if (!select) return entity;

		const result = {};
		for (const prop of select) {
			// @ts-ignore
			result[prop] = entity[prop];
		}

		// @ts-ignore
		return entity.constructor.create(result);
	}

	filter(options: Record<string, never>) {
		return this.cache.filter(options);
	}
}
