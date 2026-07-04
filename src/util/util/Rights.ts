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
        UNUSED_2: BitFlag(4),
        UNUSED_3: BitFlag(5),
        UNUSED_4: BitFlag(6),
        MANAGE_USERS: BitFlag(7),
        UNUSED_5: BitFlag(8),
        BYPASS_RATE_LIMITS: BitFlag(9),
        UNUSED_6: BitFlag(10),
        UNUSED_7: BitFlag(11),
        UNUSED_8: BitFlag(12),
        UNUSED_9: BitFlag(13),
        CREATE_GUILDS: BitFlag(14),
        CREATE_INVITES: BitFlag(15), // can create mass invites in the guilds that they have CREATE_INSTANT_INVITE
        UNUSED_10: BitFlag(16),
        UNUSED_11: BitFlag(17),
        UNUSED_12: BitFlag(18),
        JOIN_GUILDS: BitFlag(19),
        UNUSED_13: BitFlag(20),
        SELF_ADD_REACTIONS: BitFlag(21),
        SELF_DELETE_MESSAGES: BitFlag(22),
        SELF_EDIT_MESSAGES: BitFlag(23),
        UNUSED_14: BitFlag(24),
        SEND_MESSAGES: BitFlag(25),
        UNUSED_15: BitFlag(26),
        UNUSED_16: BitFlag(27),
        UNUSED_17: BitFlag(28),
        UNUSED_18: BitFlag(29),
        UNUSED_19: BitFlag(30),
        UNUSED_20: BitFlag(31),
        UNUSED_21: BitFlag(32),
        KICK_BAN_MEMBERS: BitFlag(33),
        // can kick or ban guild or group DM members in the guilds/groups that they have KICK_MEMBERS, or BAN_MEMBERS
        SELF_LEAVE_GROUPS: BitFlag(34),
        // can leave the guilds or group DMs that they joined on their own (one can always leave a guild or group DMs they have been force-added)
        PRESENCE: BitFlag(35),
        // inverts the presence confidentiality default (OPERATOR's presence is not routed by default, others' are) for a given user
        UNUSED_22: BitFlag(36),
        UNUSED_23: BitFlag(37),
        UNUSED_24: BitFlag(38),
        UNUSED_25: BitFlag(39),
        UNUSED_26: BitFlag(40),
        UNUSED_27: BitFlag(41),
        SEND_BACKDATED_EVENTS: BitFlag(42), // can send backdated events
        USE_MASS_INVITES: BitFlag(43), // added per @xnacly's request - can accept mass invites
        UNUSED_28: BitFlag(44),
        UNUSED_29: BitFlag(45), 
        UNUSED_30: BitFlag(46),
        UNUSED_31: BitFlag(47),
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
