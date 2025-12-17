/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { BitField } from "./BitField";
import { BitFieldResolvable, BitFlag } from "./BitField";
import { User } from "../entities";
import { HTTPError } from "lambert-server";

export type RightResolvable = bigint | number | Rights | RightResolvable[] | RightString;

type RightString = keyof typeof Rights.FLAGS;
// TODO: just like roles for members, users should have priviliges which combine multiple rights into one and make it easy to assign

export class Rights extends BitField {
	constructor(bits: BitFieldResolvable = 0) {
		super(bits);
		if (this.bitfield & Rights.FLAGS.OPERATOR) {
			this.bitfield = ALL_RIGHTS;
		}
	}

	static FLAGS = {
		OPERATOR: BitFlag(0), // has all rights
		MANAGE_APPLICATIONS: BitFlag(1),
		MANAGE_GUILDS: BitFlag(2), // Manage all guilds instance-wide
		MANAGE_MESSAGES: BitFlag(3), // Can't see other messages but delete/edit them in channels that they can see
		MANAGE_RATE_LIMITS: BitFlag(4),
		MANAGE_ROUTING: BitFlag(5), // can create custom message routes to any channel/guild
		MANAGE_TICKETS: BitFlag(6), // can respond to and resolve support tickets
		MANAGE_USERS: BitFlag(7),
		ADD_MEMBERS: BitFlag(8), // can manually add any members in their guilds
		BYPASS_RATE_LIMITS: BitFlag(9),
		CREATE_APPLICATIONS: BitFlag(10),
		CREATE_CHANNELS: BitFlag(11), // can create guild channels or threads in the guilds that they have permission
		CREATE_DMS: BitFlag(12),
		CREATE_DM_GROUPS: BitFlag(13), // can create group DMs or custom orphan channels
		CREATE_GUILDS: BitFlag(14),
		CREATE_INVITES: BitFlag(15), // can create mass invites in the guilds that they have CREATE_INSTANT_INVITE
		CREATE_ROLES: BitFlag(16),
		CREATE_TEMPLATES: BitFlag(17),
		CREATE_WEBHOOKS: BitFlag(18),
		JOIN_GUILDS: BitFlag(19),
		PIN_MESSAGES: BitFlag(20),
		SELF_ADD_REACTIONS: BitFlag(21),
		SELF_DELETE_MESSAGES: BitFlag(22),
		SELF_EDIT_MESSAGES: BitFlag(23),
		SELF_EDIT_NAME: BitFlag(24),
		SEND_MESSAGES: BitFlag(25),
		USE_ACTIVITIES: BitFlag(26), // use (game) activities in voice channels (e.g. Watch together)
		USE_VIDEO: BitFlag(27),
		USE_VOICE: BitFlag(28),
		INVITE_USERS: BitFlag(29), // can create user-specific invites in the guilds that they have INVITE_USERS
		SELF_DELETE_DISABLE: BitFlag(30), // can disable/delete own account
		DEBTABLE: BitFlag(31), // can use pay-to-use features
		CREDITABLE: BitFlag(32), // can receive money from monetisation related features
		KICK_BAN_MEMBERS: BitFlag(33),
		// can kick or ban guild or group DM members in the guilds/groups that they have KICK_MEMBERS, or BAN_MEMBERS
		SELF_LEAVE_GROUPS: BitFlag(34),
		// can leave the guilds or group DMs that they joined on their own (one can always leave a guild or group DMs they have been force-added)
		PRESENCE: BitFlag(35),
		// inverts the presence confidentiality default (OPERATOR's presence is not routed by default, others' are) for a given user
		SELF_ADD_DISCOVERABLE: BitFlag(36), // can mark discoverable guilds that they have permissions to mark as discoverable
		MANAGE_GUILD_DIRECTORY: BitFlag(37), // can change anything in the primary guild directory
		POGGERS: BitFlag(38), // can send confetti, screenshake, random user mention (@someone)
		USE_ACHIEVEMENTS: BitFlag(39), // can use achievements and cheers
		INITIATE_INTERACTIONS: BitFlag(40), // can initiate interactions
		RESPOND_TO_INTERACTIONS: BitFlag(41), // can respond to interactions
		SEND_BACKDATED_EVENTS: BitFlag(42), // can send backdated events
		USE_MASS_INVITES: BitFlag(43), // added per @xnacly's request - can accept mass invites
		ACCEPT_INVITES: BitFlag(44), // added per @xnacly's request - can accept user-specific invites and DM requests
		SELF_EDIT_FLAGS: BitFlag(45), // can modify own flags
		EDIT_FLAGS: BitFlag(46), // can set others' flags
		MANAGE_GROUPS: BitFlag(47), // can manage others' groups
		VIEW_SERVER_STATS: BitFlag(48), // added per @chrischrome's request - can view server stats)
		RESEND_VERIFICATION_EMAIL: BitFlag(49), // can resend verification emails (/auth/verify/resend)
		CREATE_REGISTRATION_TOKENS: BitFlag(50), // can create registration tokens (/auth/generate-registration-tokens)
	};

	any(permission: RightResolvable, checkOperator = true) {
		return (checkOperator && super.any(Rights.FLAGS.OPERATOR)) || super.any(permission);
	}

	has(permission: RightResolvable, checkOperator = true) {
		return (checkOperator && super.has(Rights.FLAGS.OPERATOR)) || super.has(permission);
	}

	hasThrow(permission: RightResolvable) {
		if (this.has(permission)) return true;
		throw new HTTPError(`You are missing the following rights ${permission}`, 403);
	}
}

const ALL_RIGHTS = Object.values(Rights.FLAGS).reduce((total, val) => total | val, BigInt(0));

export async function getRights(
	user_id: string,
	/**, opts: {
		in_behalf?: (keyof User)[];
	} = {} **/
) {
	const user = await User.findOneOrFail({ where: { id: user_id } });
	return new Rights(user.rights);
}
