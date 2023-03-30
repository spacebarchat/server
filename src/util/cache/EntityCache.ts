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
/* eslint-disable */
import {
	DataSource,
	FindOneOptions,
	EntityNotFoundError,
	FindOptionsWhere,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseClassWithId } from "../entities/BaseClass";
import { Config, getDatabase, RabbitMQ } from "../util";
import { CacheManager } from "./Cache";

function getObjectKeysAsArray(obj?: Record<string, any>) {
	if (!obj) return [];
	if (Array.isArray(obj)) return obj;
	return Object.keys(obj);
}

export type ThisType<T> = {
	new (): T;
} & typeof BaseEntityCache;

interface BaseEntityCache {
	constructor: typeof BaseEntityCache;
}

// @ts-ignore
class BaseEntityCache extends BaseClassWithId {
	static cache: CacheManager;
	static cacheEnabled: boolean;

	public get metadata() {
		return getDatabase()?.getMetadata(this.constructor)!;
	}

	static useDataSource(dataSource: DataSource | null) {
		super.useDataSource(dataSource);
		const isMultiThreaded =
			process.env.EVENT_TRANSMISSION === "process" || RabbitMQ.connection;
		this.cacheEnabled = Config.get().cache.enabled ?? !isMultiThreaded;
		if (Config.get().cache.redis) return; // TODO: Redis cache
		if (!this.cacheEnabled) return;
		this.cache = new CacheManager();
	}

	static async findOne<T extends BaseEntityCache>(
		this: ThisType<T>,
		options: FindOneOptions<T>,
	) {
		// @ts-ignore
		if (!this.cacheEnabled) return super.findOne(options);
		let select = getObjectKeysAsArray(options.select);

		if (!select.length) {
			// get all columns that are marked as select
			getDatabase()
				?.getMetadata(this)
				.columns.forEach((x) => {
					if (!x.isSelect) return;
					select.push(x.propertyName);
				});
		}
		if (options.relations) {
			select.push(...getObjectKeysAsArray(options.relations));
		}

		const cacheResult = this.cache.find(options.where as never, select);
		if (cacheResult) {
			const hasAllProps = select.every((key) => {
				if (key.includes(".")) return true; // @ts-ignore
				return cacheResult[key] !== undefined;
			});
			// console.log(`[Cache] get ${cacheResult.id} from ${cacheResult.constructor.name}`,);
			if (hasAllProps) return cacheResult;
		}

		// @ts-ignore
		const result = await super.findOne<T>(options);
		if (!result) return null;

		this.cache.insert(result as any);

		return result;
	}

	static async findOneOrFail<T extends BaseEntityCache>(
		this: ThisType<T>,
		options: FindOneOptions<T>,
	) {
		const result = await this.findOne<T>(options);
		if (!result) throw new EntityNotFoundError(this, options);
		return result;
	}

	save() {
		if (this.constructor.cacheEnabled) this.constructor.cache.insert(this);
		return super.save();
	}

	remove() {
		if (this.constructor.cacheEnabled)
			this.constructor.cache.delete(this.id);
		return super.remove();
	}

	static async update<T extends BaseEntityCache>(
		this: ThisType<T>,
		criteria: FindOptionsWhere<T>,
		partialEntity: QueryDeepPartialEntity<T>,
	) {
		// @ts-ignore
		const result = super.update<T>(criteria, partialEntity);
		if (!this.cacheEnabled) return result;

		const entities = this.cache.filter(criteria as never);
		for (const entity of entities) {
			// @ts-ignore
			partialEntity.id = entity.id;
			this.cache.insert(partialEntity as never);
		}

		return result;
	}

	static async delete<T extends BaseEntityCache>(
		this: ThisType<T>,
		criteria: FindOptionsWhere<T>,
	) {
		// @ts-ignore
		const result = super.delete<T>(criteria);
		if (!this.cacheEnabled) return result;

		const entities = this.cache.filter(criteria as never);
		for (const entity of entities) {
			this.cache.delete(entity.id);
		}

		return result;
	}
}

// needed, because typescript can't infer the type of the static methods with generics
const EntityCache = BaseEntityCache as unknown as typeof BaseClassWithId;

export { EntityCache };
