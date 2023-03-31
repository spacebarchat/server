// based on https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah, 2022 Erkin Alp Güney
// @fc-license-skip

import { BitField } from "./BitField";

export class MessageFlags extends BitField {
	static FLAGS = {
		CROSSPOSTED: BigInt(1) << BigInt(0),
		IS_CROSSPOST: BigInt(1) << BigInt(1),
		SUPPRESS_EMBEDS: BigInt(1) << BigInt(2),
		// SOURCE_MESSAGE_DELETED: BigInt(1) << BigInt(3), // spacebar will delete them from destination too, making this redundant
		URGENT: BigInt(1) << BigInt(4),
		// HAS_THREAD: BigInt(1) << BigInt(5) // does not apply to spacebar due to infrastructural differences
		PRIVATE_ROUTE: BigInt(1) << BigInt(6), // it that has been routed to only some of the users that can see the channel
		INTERACTION_WAIT: BigInt(1) << BigInt(7), // discord.com calls this LOADING
		// FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: BigInt(1) << BigInt(8)
		SCRIPT_WAIT: BigInt(1) << BigInt(24), // waiting for the self command to complete
		IMPORT_WAIT: BigInt(1) << BigInt(25), // latest message of a bulk import, waiting for the rest of the channel to be backfilled
	};
}
