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

// based on https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah, 2022 Erkin Alp Güney

import { BitField } from "./BitField";

export class MessageFlags extends BitField {
	static FLAGS = {
		CROSSPOSTED: BigInt(1) << BigInt(0),
		IS_CROSSPOST: BigInt(1) << BigInt(1),
		SUPPRESS_EMBEDS: BigInt(1) << BigInt(2),
		// SOURCE_MESSAGE_DELETED: BigInt(1) << BigInt(3), // fosscord will delete them from destination too, making this redundant
		URGENT: BigInt(1) << BigInt(4),
		// HAS_THREAD: BigInt(1) << BigInt(5) // does not apply to fosscord due to infrastructural differences
		PRIVATE_ROUTE: BigInt(1) << BigInt(6), // it that has been routed to only some of the users that can see the channel
		INTERACTION_WAIT: BigInt(1) << BigInt(7), // discord.com calls this LOADING
		// FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: BigInt(1) << BigInt(8)
		SCRIPT_WAIT: BigInt(1) << BigInt(24), // waiting for the self command to complete
		IMPORT_WAIT: BigInt(1) << BigInt(25), // latest message of a bulk import, waiting for the rest of the channel to be backfilled
	};
}
