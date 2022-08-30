export function containsAll(arr: any[], target: any[]) {
	return target.every((v) => arr.includes(v));
}
