// https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah

import { BitField } from "./BitField";

export class MessageFlags extends BitField {
	static FLAGS = {
		CROSSPOSTED: 1 << 0,
		IS_CROSSPOST: 1 << 1,
		SUPPRESS_EMBEDS: 1 << 2,
		SOURCE_MESSAGE_DELETED: 1 << 3,
		URGENT: 1 << 4,
	};
}
