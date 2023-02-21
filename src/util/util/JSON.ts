// Discord.com sends ISO strings with +00:00 extension, not Z
// This causes issues with Python bot libs
const JSONReplacer = function (
	this: { [key: string]: unknown },
	key: string,
	value: unknown,
) {
	if (this[key] instanceof Date) {
		return (this[key] as Date).toISOString().replace("Z", "+00:00");
	}

	return value;
};

export { JSONReplacer };
