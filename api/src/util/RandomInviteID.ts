import { Snowflake } from "@fosscord/util";

export function random(length = 6) {
	// Declare all characters
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	// Pick characers randomly
	let str = "";
	for (let i = 0; i < length; i++) {
		str += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return str;
}

export function snowflakeBasedInvite() {
	// Declare all characters
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let base = BigInt(chars.length);
	let snowflake = Snowflake.generateWorkerProcess();

	// snowflakes hold ~10.75 characters worth of entropy;
	// safe to generate a 8-char invite out of them
	let str = "";
	for (let i=0; i < 10; i++) {
		
		str.concat(chars.charAt(Number(snowflake % base)));
		snowflake = snowflake / base;
	}
	
	return str.substr(3,8).split("").reverse().join("");
}
