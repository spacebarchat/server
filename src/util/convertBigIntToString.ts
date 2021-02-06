import "missing-native-js-functions";

export function convertBigIntToString(obj: any) {
	if (typeof obj === "bigint") obj = obj.toString();

	if (typeof obj === "object") {
		obj.keys().forEach((key: string) => {
			obj[key] = convertBigIntToString(obj[key]);
		});
	}

	return obj;
}
