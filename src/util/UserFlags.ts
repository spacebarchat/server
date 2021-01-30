// https://github.com/discordjs/discord.js/blob/master/src/util/UserFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah

import { BitField } from "./BitField";

export class UserFlags extends BitField {
	static FLAGS = {
		DISCORD_EMPLOYEE: 1 << 0,
		PARTNERED_SERVER_OWNER: 1 << 1,
		HYPESQUAD_EVENTS: 1 << 2,
		BUGHUNTER_LEVEL_1: 1 << 3,
		HOUSE_BRAVERY: 1 << 6,
		HOUSE_BRILLIANCE: 1 << 7,
		HOUSE_BALANCE: 1 << 8,
		EARLY_SUPPORTER: 1 << 9,
		TEAM_USER: 1 << 10,
		SYSTEM: 1 << 12,
		BUGHUNTER_LEVEL_2: 1 << 14,
		VERIFIED_BOT: 1 << 16,
		EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
	};
}
