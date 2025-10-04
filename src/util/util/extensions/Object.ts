declare global {
	interface Object {
		forEach<T>(callback: (value: T, key: string, object: { [index: string]: T }) => void): void;
		map<SV, TV>(callback: (value: SV, key: string, object: { [index: string]: SV }) => TV): { [index: string]: TV };
	}
}

export function objectForEach<T>(obj: { [index: string]: T }, callback: (value: T, key: string, object: { [index: string]: T }) => void): void {
	Object.keys(obj).forEach((key) => {
		callback(obj[key], key, obj);
	});
}

export function objectMap<SV, TV>(srcObj: { [index: string]: SV }, callback: (value: SV, key: string, object: { [index: string]: SV }) => TV): { [index: string]: TV } {
	if (typeof callback !== "function") throw new TypeError(`${callback} is not a function`);
	const obj: { [index: string]: TV } = {};
	Object.keys(srcObj).forEach((key) => {
		obj[key] = callback(srcObj[key], key, srcObj);
	});
	return obj;
}

if (!Object.prototype.forEach)
	Object.defineProperty(Object.prototype, "forEach", {
		value: objectForEach,
		enumerable: false,
		writable: true,
	});
if (!Object.prototype.map)
	Object.defineProperty(Object.prototype, "map", {
		value: objectMap,
		enumerable: false,
		writable: true,
	});
