//source: https://github.com/typeorm/typeorm/blob/master/src/util/OrmUtils.ts
export class OrmUtils {
	// Checks if it's an object made by Object.create(null), {} or new Object()
	private static isPlainObject(item: any) {
		if (item === null || item === undefined) {
			return false;
		}

		return !item.constructor || item.constructor === Object;
	}

	private static mergeArrayKey(target: any, key: number, value: any, memo: Map<any, any>) {
		// Have we seen this before?  Prevent infinite recursion.
		if (memo.has(value)) {
			target[key] = memo.get(value);
			return;
		}

		if (value instanceof Promise) {
			// Skip promises entirely.
			// This is a hold-over from the old code & is because we don't want to pull in
			// the lazy fields.  Ideally we'd remove these promises via another function first
			// but for now we have to do it here.
			return;
		}

		if (!this.isPlainObject(value) && !Array.isArray(value)) {
			target[key] = value;
			return;
		}

		if (!target[key]) {
			target[key] = Array.isArray(value) ? [] : {};
		}

		memo.set(value, target[key]);
		this.merge(target[key], value, memo);
		memo.delete(value);
	}

	private static mergeObjectKey(target: any, key: string, value: any, memo: Map<any, any>) {
		// Have we seen this before?  Prevent infinite recursion.
		if (memo.has(value)) {
			Object.assign(target, { [key]: memo.get(value) });
			return;
		}

		if (value instanceof Promise) {
			// Skip promises entirely.
			// This is a hold-over from the old code & is because we don't want to pull in
			// the lazy fields.  Ideally we'd remove these promises via another function first
			// but for now we have to do it here.
			return;
		}

		if (!this.isPlainObject(value) && !Array.isArray(value)) {
			Object.assign(target, { [key]: value });
			return;
		}

		if (!target[key]) {
			Object.assign(target, { [key]: value });
		}

		memo.set(value, target[key]);
		this.merge(target[key], value, memo);
		memo.delete(value);
	}

	private static merge(target: any, source: any, memo: Map<any, any> = new Map()): any {
		if (Array.isArray(target) && Array.isArray(source)) {
			for (let key = 0; key < source.length; key++) {
				this.mergeArrayKey(target, key, source[key], memo);
			}
		} else {
			for (const key of Object.keys(source)) {
				this.mergeObjectKey(target, key, source[key], memo);
			}
		}
	}

	/**
	 * Deep Object.assign.
	 */
	static mergeDeep(target: any, ...sources: any[]): any {
		if (!sources.length) {
			return target;
		}

		for (const source of sources) {
			OrmUtils.merge(target, source);
		}

		return target;
	}
}
