declare global {
	interface Object {
		forEach(callback: (value: any, key: string, object: any) => void): void;
		map<T>(callback: (value: any, key: string, object: any) => T): T[];
	}
}

export function objectForEach(obj: any, callback: (value: any, key: string, object: any) => void): void {
	Object.keys(obj).forEach((key) => {
		callback(obj[key], key, obj);
	});
}

export function objectMap<T>(obj: any, callback: (value: any, key: string, object: any) => T): T[] {
	return Object.keys(obj).map((key) => {
		return callback(obj[key], key, obj);
	});
}

if (!Object.prototype.forEach)
	Object.defineProperty(Object.prototype, "forEach", {
		value: objectForEach,
		enumerable: false,
	});
if (!Object.prototype.map)
	Object.defineProperty(Object.prototype, "map", {
		value: objectMap,
		enumerable: false,
	});