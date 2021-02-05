// https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah

import { BitField } from "./BitField";

export class MessageFlags extends BitField {
	static FLAGS = {
		CROSSPOSTED: 1n << 0n,
		IS_CROSSPOST: 1n << 1n,
		SUPPRESS_EMBEDS: 1n << 2n,
		SOURCE_MESSAGE_DELETED: 1n << 3n,
		URGENT: 1n << 4n,
	};
}
