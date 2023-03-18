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
import { BaseEntityWithId, Cache } from "./Cache";

export const cacheTimeout = 1000 * 60 * 5;

export class LocalCache extends Map<string, BaseEntityWithId> implements Cache {
	last_access = new Map<string, number>();

	constructor() {
		super();

		setInterval(() => {
			const now = Date.now();
			for (const [key, value] of this.last_access) {
				if (now - value > cacheTimeout) {
					this.delete(key);
					this.last_access.delete(key);
				}
			}
		}, cacheTimeout);
	}

	set(key: string, value: BaseEntityWithId): this {
		this.last_access.set(key, Date.now());
		if (this.has(key)) this.update(key, value);
		return super.set(key, value as never);
	}

	get(key: string) {
		const value = super.get(key);
		if (value) this.last_access.set(key, Date.now());
		return value;
	}

	update(id: string, entity: BaseEntityWithId) {
		const oldEntity = this.get(id);
		if (!oldEntity) return;
		for (const key in entity) {
			// @ts-ignore
			if (entity[key] === undefined) continue; // @ts-ignore
			oldEntity[key] = entity[key];
		}
	}

	find(options: Record<string, never>): BaseEntityWithId | undefined {
		if (options.id && Object.keys(options).length === 1) {
			return this.get(options.id);
		}
		for (const entity of this.values()) {
			if (objectFulfillsQuery(entity, options)) return entity;
		}
	}

	filter(options: Record<string, never>): BaseEntityWithId[] {
		const result = [];
		for (const entity of this.values()) {
			if (objectFulfillsQuery(entity, options)) {
				result.push(entity);
			}
		}
		return result;
	}
}

function objectFulfillsQuery(
	entity: BaseEntityWithId,
	options: Record<string, never>,
) {
	for (const key in options) {
		// @ts-ignore
		if (entity[key] !== options[key]) return false;
	}
	return true;
}
