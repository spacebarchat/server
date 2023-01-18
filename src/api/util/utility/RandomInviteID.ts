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

import { Snowflake } from "@fosscord/util";
import crypto from "crypto";

// TODO: 'random'? seriously? who named this?
// And why is this even here? Just use cryto.randomBytes?

export function random(length = 6) {
	// Declare all characters
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	// Pick characers randomly
	let str = "";
	for (let i = 0; i < length; i++) {
		str += chars.charAt(Math.floor(crypto.randomInt(chars.length)));
	}

	return str;
}

export function snowflakeBasedInvite() {
	// Declare all characters
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const base = BigInt(chars.length);
	let snowflake = Snowflake.generateWorkerProcess();

	// snowflakes hold ~10.75 characters worth of entropy;
	// safe to generate a 8-char invite out of them
	const str = "";
	for (let i = 0; i < 10; i++) {
		str.concat(chars.charAt(Number(snowflake % base)));
		snowflake = snowflake / base;
	}

	return str.substr(3, 8).split("").reverse().join("");
}
