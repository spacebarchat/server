// https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah

import { BitField } from "./BitField";

export class MessageFlags extends BitField {
	static FLAGS = {
		CROSSPOSTED: BigInt(1) << BigInt(0),
		IS_CROSSPOST: BigInt(1) << BigInt(1),
		SUPPRESS_EMBEDS: BigInt(1) << BigInt(2),
		SOURCE_MESSAGE_DELETED: BigInt(1) << BigInt(3),
		URGENT: BigInt(1) << BigInt(4),
	};
}
