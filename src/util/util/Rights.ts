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

import { BitField, BitFieldResolvable, BitFlag } from "./BitField";
import { User } from "../../database/entities";
import { HTTPError } from "lambert-server/HTTPError";

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
        UNUSED_1: BitFlag(1),
        MANAGE_GUILDS: BitFlag(2), // Manage all guilds instance-wide
        MANAGE_MESSAGES: BitFlag(3), // Can't see other messages but delete/edit them in channels that they can see
		UNUSED_2: BitFlag(4), //PREVIOUS IDENTITY: MANAGE_RATE_LIMITS
        UNUSED_3: BitFlag(5), //PREVIOUS IDENTITY: MANAGE_ROUTING - can create custom message routes to any channel/guild
        UNUSED_4: BitFlag(6), //PREVIOUS IDENTITY: MANAGE_TICKETS - can respond to and resolve support tickets
        MANAGE_USERS: BitFlag(7),
        UNUSED_5: BitFlag(8), //PREVIOUS IDENTITY ADD_MEMBERS - can manually add any members in their guilds
        BYPASS_RATE_LIMITS: BitFlag(9),
		UNUSED_6: BitFlag(10), //PREVIOUS IDENTITY: CREATE_APPLICATIONS
        UNUSED_7: BitFlag(11), //PREVIOUS IDENTITY: CREATE_CHANNELS - can create guild channels or threads in the guilds that they have permission
        UNUSED_8: BitFlag(12), //PREVIOUS IDENTITY: CREATE_DMS
        UNUSED_9: BitFlag(13), //PREVIOUS IDENTITY: CREATE_DM_GROUPS - can create group DMs or custom orphan channels
        CREATE_GUILDS: BitFlag(14),
        CREATE_INVITES: BitFlag(15), // can create mass invites in the guilds that they have CREATE_INSTANT_INVITE
        UNUSED_10: BitFlag(16), //PREVIOUS IDENTITY: CREATE_ROLES
        UNUSED_11: BitFlag(17), //PREVIOUS IDENTITY: CREATE_TEMPLATES
        UNUSED_12: BitFlag(18), //PREVIOUS IDENTITY: CREATE_WEBHOOKS
        JOIN_GUILDS: BitFlag(19),
        UNUSED_13: BitFlag(20), //PREVIOUS IDENTITY: PIN_MESSAGES
        SELF_ADD_REACTIONS: BitFlag(21),
        SELF_DELETE_MESSAGES: BitFlag(22),
        SELF_EDIT_MESSAGES: BitFlag(23),
        UNUSED_14: BitFlag(24), //PREVIOUS IDENTITY: SELF_EDIT_NAME
        SEND_MESSAGES: BitFlag(25),
        UNUSED_15: BitFlag(26), //PREVIOUS IDENTITY: USE_ACTIVITIES - use (game) activities in voice channels (e.g. Watch together)
        UNUSED_16: BitFlag(27), //PREVIOUS IDENTITY: USE_VIDEO
        UNUSED_17: BitFlag(28), //PREVIOUS IDENTITY: USE_VOICE
        UNUSED_18: BitFlag(29), //PREVIOUS IDENTITY: INVITE_USERS - can create user-specific invites in the guilds that they have INVITE_USERS
        UNUSED_19: BitFlag(30), //PREVIOUS IDENTITY: SELF_DELETE_DISABLE - can disable/delete own account
        UNUSED_20: BitFlag(31), //PREVIOUS IDENTITY: DEBTABLE -can use pay-to-use features
        UNUSED_21: BitFlag(32), //PREVIOUS IDENTITY: CREDITABLE - can receive money from monetisation related features
        KICK_BAN_MEMBERS: BitFlag(33),
        // can kick or ban guild or group DM members in the guilds/groups that they have KICK_MEMBERS, or BAN_MEMBERS
        SELF_LEAVE_GROUPS: BitFlag(34),
        // can leave the guilds or group DMs that they joined on their own (one can always leave a guild or group DMs they have been force-added)
        PRESENCE: BitFlag(35),
        // inverts the presence confidentiality default (OPERATOR's presence is not routed by default, others' are) for a given user
		UNUSED_22: BitFlag(36), //PREVIOUS IDENTITY: SELF_ADD_DISCOVERABLE - can mark discoverable guilds that they have permissions to mark as discoverable
        UNUSED_23: BitFlag(37), //PREVIOUS IDENTITY: MANAGE_GUILD_DIRECTORY - can change anything in the primary guild directory
        UNUSED_24: BitFlag(38), //PREVIOUS IDENTITY: POGGERS - can send confetti, screenshake, random user mention (@someone)
        UNUSED_25: BitFlag(39), //PREVIOUS IDENTITY: USE_ACHIEVEMENTS - can use achievements and cheers
        UNUSED_26: BitFlag(40), //PREVIOUS IDENTITY: INITIATE_INTERACTIONS - can initiate interactions
        UNUSED_27: BitFlag(41), //PREVIOUS IDENTITY: RESPOND_TO_INTERACTIONS - can respond to interactions
        SEND_BACKDATED_EVENTS: BitFlag(42), // can send backdated events
        USE_MASS_INVITES: BitFlag(43), // added per @xnacly's request - can accept mass invites
        UNUSED_28: BitFlag(44), //PREVIOUS IDENTITY: ACCEPT_INVITES - added per @xnacly's request - can accept user-specific invites and DM requests
        UNUSED_29: BitFlag(45), //PREVIOUS IDENTITY: SELF_EDIT_FLAGS - can modify own flags
        UNUSED_30: BitFlag(46), //PREVIOUS IDENTITY: EDIT_FLAGS - can set others' flags
        UNUSED_31: BitFlag(47), //PREVIOUS IDENTITY: MANAGE_GROUPS - can manage others' groups
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
