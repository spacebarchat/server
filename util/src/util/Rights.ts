import { BitField } from "./BitField";
import "missing-native-js-functions";
import { BitFieldResolvable, BitFlag } from "./BitField";

var HTTPError: any;

try {
	HTTPError = require("lambert-server").HTTPError;
} catch (e) {
	HTTPError = Error;
}

export type RightResolvable = bigint | number | Rights | RightResolvable[] | RightString;

type RightString = keyof typeof Rights.FLAGS;
// TODO: just like roles for members, users should have privilidges which combine multiple rights into one and make it easy to assign

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
		MANAGE_GUILDS: BitFlag(2),
		MANAGE_MESSAGES: BitFlag(3), // Can't see other messages but delete/edit them in channels that they can see
		MANAGE_RATE_LIMITS: BitFlag(4),
		MANAGE_ROUTING: BitFlag(5), // can create custom message routes to any channel/guild
		MANAGE_TICKETS: BitFlag(6), // can respond to and resolve support tickets
		MANAGE_USERS: BitFlag(7),
		ADD_MEMBERS: BitFlag(8), // can manually add any members in their guilds
		BYPASS_RATE_LIMITS: BitFlag(9),
		CREATE_APPLICATIONS: BitFlag(10),
		CREATE_CHANNELS: BitFlag(11),
		CREATE_DMS: BitFlag(12),
		CREATE_DM_GROUPS: BitFlag(13),
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
	};

	any(permission: RightResolvable, checkOperator = true) {
		return (checkOperator && super.any(Rights.FLAGS.OPERATOR)) || super.any(permission);
	}

	has(permission: RightResolvable, checkOperator = true) {
		return (checkOperator && super.has(Rights.FLAGS.OPERATOR)) || super.has(permission);
	}

	hasThrow(permission: RightResolvable) {
		if (this.has(permission)) return true;
		// @ts-ignore
		throw new HTTPError(`You are missing the following rights ${permission}`, 403);
	}
}

const ALL_RIGHTS = Object.values(Rights.FLAGS).reduce((total, val) => total | val, BigInt(0));
