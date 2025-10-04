declare global {
	interface Object {
		forEach(callback: (value: unknown, key: string, object: unknown) => void): void;
		map<T>(callback: (value: unknown, key: string, object: unknown) => T): object;
	}
}

export function objectForEach<T>(obj: never, callback: (value: T, key: string, object: unknown) => void): void {
	Object.keys(obj).forEach((key) => {
		callback(obj[key], key, obj);
	});
}

export function objectMap<T>(obj: object, callback: (value: unknown, key: string, object: unknown) => T): T[] {
	return Object.keys(obj).map((key) => {
		return callback(obj[key], key, obj);
	});
}

if (!Object.prototype.forEach)
	Object.defineProperty(Object.prototype, "forEach", {
		value: objectForEach,
		enumerable: false,
		writable: true
	});
if (!Object.prototype.map)
	Object.defineProperty(Object.prototype, "map", {
		value: objectMap,
		enumerable: false,
		writable: true
	});